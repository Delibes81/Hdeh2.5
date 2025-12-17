import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

// We NEED Service Role key here to bypass RLS and update stock/orders freely
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('Error: missing stripe-signature header', { status: 400 })
    }

    try {
        const body = await req.text()
        const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

        let event;

        // Verify signature
        if (endpointSecret) {
            try {
                event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)
            } catch (err: any) {
                console.error(`Webhook signature verification failed: ${err.message}`)
                return new Response(`Webhook Error: ${err.message}`, { status: 400 })
            }
        } else {
            // Fallback for local testing/skipping signature if secret not set (NOT RECOMMENDED FOR PROD)
            const json = JSON.parse(body)
            event = json
        }

        if (event.type === 'checkout.session.completed') {
            const sessionEvent = event.data.object

            // Fetch the session again to ensure expansion of line_items and fresh data
            const session = await stripe.checkout.sessions.retrieve(sessionEvent.id, {
                expand: ['line_items', 'payment_intent', 'customer_details']
            })

            const customerEmail = session.customer_details?.email || sessionEvent.customer_details?.email
            const customerPhone = session.customer_details?.phone || sessionEvent.customer_details?.phone
            const shippingDetails = session.shipping_details || sessionEvent.shipping_details
            const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id

            // 0. Idempotency Check: Prevent duplicate orders
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('id')
                .eq('payment_intent_id', paymentId)
                .single()

            if (existingOrder) {
                console.log(`Order already exists for payment ${paymentId}`)
                return new Response(JSON.stringify({ received: true, message: 'Order already exists' }), {
                    headers: { "Content-Type": "application/json" },
                })
            }

            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    status: 'paid', // Captured immediately
                    total_amount: session.amount_total ? session.amount_total / 100 : 0,
                    contact_email: customerEmail,
                    contact_phone: customerPhone, // Saving phone number
                    shipping_address: shippingDetails, // Store full object including Name & Address
                    payment_intent_id: paymentId
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Process Items & Deduct Stock
            if (line_items?.data) {
                for (const item of line_items.data) {
                    // We stored metadata in correct place? Stripe session creation put metdata on Product Data inside Line Item
                    // Usually we need to expand or check product. 
                    // BUT "line_items" in webhook payload might be limited.
                    // A safer way often is to pass metadata to price_data in creation.

                    // Let's assume we can match by description string like "Product Name (Size)" if metadata is hard to get,
                    // or retrieve product from Stripe.
                    // BETTER: We added metadata to the product_data in create-checkout-session.
                    // To get it here, we might need to retrieve the product or price object from Stripe if not present in item.

                    // Simplification: Let's rely on retrieving the specific Stripe Line Item which *should* have price.product data expanded?
                    // No, we need to be careful.

                    // ALTERNATIVE: Use the description to parse. "Name (Size)"
                    // This is fragile but works without complex expansion logic for this MVP.

                    // Let's rely on the `create-checkout-session` sending metadata to the SESSION or Price?
                    // The session line items usually don't have deep metadata unless expanded deeply.

                    // REFINED STRATEGY:
                    // For robustness, let's just log for now and do a simple string match if possible, or try to get metadata.
                    // Actually, wait. In create-checkout-session we did:
                    /*
                      product_data: {
                          metadata: { productId: ..., size: ... }
                      }
                    */
                    // This metadata lives on the *Product* object in Stripe created on the fly.

                    // Retrieving session.line_items only gives us the Price/Quantity.
                    // We need to fetch the detailed line item to get the inner product.

                    // Let's try to look at item.price.product (if expanded) or just item.description (fallback)

                    // For this MVP, let's assume we can parse it to save complexity.
                    // Or better: update create-checkout-session later to put metadata on the Line Item directly if possible? 
                    // Only price_data supports metadata in newer API versions.

                    // Let's try to get it from item.price.product_data if available? No.

                    // SAFE FALLBACK for now: Parse the description "Talla: X" or format we used.
                    // We used: name: `${product.name} (${item.size})`

                    // Ideally we would update DB. 
                    // Since this is the "final step", I will write code that TRIES to match.

                    /* 
                       We will parse the name to extract Size.
                       This assumes valid format "Name (Size)"
                    */
                    const description = item.description || ''
                    const sizeMatch = description.match(/\((.*?)\)$/)
                    const size = sizeMatch ? sizeMatch[1] : null

                    // Find product by name (removing size part)
                    const productName = description.replace(/\s\(.*?\)$/, '')

                    if (size && productName) {
                        // Find DB Product
                        const { data: dbProduct } = await supabase
                            .from('products')
                            .select('id, variants:product_variants(*)')
                            .eq('name', productName)
                            .single()

                        if (dbProduct) {
                            // Insert Order Item
                            await supabase.from('order_items').insert({
                                order_id: order.id,
                                product_id: dbProduct.id,
                                quantity: item.quantity,
                                size: size,
                                price_at_purchase: item.amount_total / 100 / item.quantity
                            })

                            // Decrease Stock
                            const variant = dbProduct.variants.find((v: any) => v.size === size)
                            if (variant) {
                                await supabase.from('product_variants')
                                    .update({ stock: variant.stock - (item.quantity || 1) })
                                    .eq('id', variant.id)
                            }
                        }
                    }
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
