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
                expand: ['line_items.data.price.product', 'payment_intent', 'customer_details']
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
                console.log(`Processing ${line_items.data.length} line items...`)
                for (const item of line_items.data) {
                    const description = item.description || ''
                    // Try to extract size from format "Product Name (Size)"
                    const sizeMatch = description.match(/\(([^)]+)\)$/) // Match content inside parens
                    const size = sizeMatch ? sizeMatch[1] : null

                    // Product Name: Remove only the LAST parenthesized part (size) to get the name
                    const productName = description.replace(/\s\([^)]+\)$/, '').trim()

                    console.log(`Processing Item: ${description} (Name: ${productName}, Size: ${size})`)

                    if (size && productName) {
                        // Find DB Product
                        const { data: dbProduct, error: prodError } = await supabase
                            .from('products')
                            .select('id, variants:product_variants(*)')
                            .eq('name', productName)
                            .single()

                        if (prodError || !dbProduct) {
                            console.error(`Product not found in DB: ${productName}`)
                            continue
                        }

                        // Insert Order Item
                        const { error: itemInsertError } = await supabase.from('order_items').insert({
                            order_id: order.id,
                            product_id: dbProduct.id,
                            quantity: item.quantity,
                            size: size,
                            price_at_purchase: (item.amount_total || 0) / 100 / (item.quantity || 1)
                        })

                        if (itemInsertError) {
                            console.error(`Error inserting order item: ${itemInsertError.message}`)
                        }

                        // Decrease Stock
                        const variant = dbProduct.variants.find((v: any) => v.size === size)
                        if (variant) {
                            await supabase.from('product_variants')
                                .update({ stock: variant.stock - (item.quantity || 1) })
                                .eq('id', variant.id)
                        } else {
                            console.warn(`Variant not found for stock deduction: ${productName} size ${size}`)
                        }
                    } else {
                        console.warn(`Could not parse size/name from description: ${description}`)
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
