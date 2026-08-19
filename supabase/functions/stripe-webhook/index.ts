import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing required Stripe or Supabase environment variables')
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
})

// We NEED Service Role key here to bypass RLS and update stock/orders freely
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

type AtomicOrderItem = {
    product_id: string
    size: string
    quantity: number
    price_at_purchase: number
}

type AtomicOrderResult = {
    order_id: string
    created: boolean
    requires_production: boolean
}

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', {
            status: 405,
            headers: { Allow: 'POST' },
        })
    }

    const signature = req.headers.get('stripe-signature')
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature) {
        return new Response('Error: missing stripe-signature header', { status: 400 })
    }

    if (!endpointSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured')
        return new Response('Webhook is not configured', { status: 500 })
    }

    try {
        const body = await req.text()
        let event: Stripe.Event

        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Invalid signature'
            console.error(`Webhook signature verification failed: ${message}`)
            return new Response('Webhook signature verification failed', { status: 400 })
        }

        if (event.type === 'checkout.session.completed') {
            const sessionEvent = event.data.object

            // Fetch the session again to ensure expansion of line_items and fresh data
            // CRITICAL: We expand 'line_items.data.price.product' to get the metadata we added in create-checkout-session
            const session = await stripe.checkout.sessions.retrieve(sessionEvent.id, {
                expand: ['line_items.data.price.product', 'payment_intent', 'customer_details']
            })

            const paymentAccepted = session.payment_status === 'paid'
                || session.payment_status === 'no_payment_required'

            if (session.status !== 'complete' || !paymentAccepted) {
                console.warn(`Ignoring incomplete or unpaid checkout session ${session.id}`)
                return new Response(JSON.stringify({ received: true, ignored: 'payment_not_completed' }), {
                    headers: { "Content-Type": "application/json" },
                })
            }

            if (!session.line_items?.data?.length) {
                throw new Error(`Checkout session ${session.id} has no line items`)
            }

            const hasStoreMetadata = session.metadata?.source === 'hdehelena-store'
                || session.line_items.data.every((item) => {
                    const product = item.price?.product
                    return typeof product === 'object'
                        && product !== null
                        && 'metadata' in product
                        && Boolean(product.metadata?.productId)
                        && Boolean(product.metadata?.size)
                })

            if (!hasStoreMetadata) {
                console.warn(`Ignoring checkout session ${session.id} from an unknown source`)
                return new Response(JSON.stringify({ received: true, ignored: 'unknown_source' }), {
                    headers: { "Content-Type": "application/json" },
                })
            }

            const customerEmail = session.customer_details?.email || sessionEvent.customer_details?.email
            const customerPhone = session.customer_details?.phone || sessionEvent.customer_details?.phone
            const shippingDetails = session.shipping_details || sessionEvent.shipping_details
            // Ensure payment_intent is a string
            const paymentId = typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id
            const paymentReference = paymentId || `checkout_session:${session.id}`

            if (!customerEmail || !shippingDetails) {
                throw new Error(`Checkout session ${session.id} is missing customer or shipping details`)
            }

            // Resolve every Stripe line item before starting the database transaction.
            const orderItems: AtomicOrderItem[] = []
            console.log(`Resolving ${session.line_items.data.length} line items...`)

            for (const item of session.line_items.data) {
                const quantity = item.quantity || 0
                if (!Number.isInteger(quantity) || quantity <= 0) {
                    throw new Error(`Invalid quantity in checkout session ${session.id}`)
                }

                let productId: string | null = null
                let size: string | null = null
                const stripeProduct = item.price?.product

                if (stripeProduct && typeof stripeProduct === 'object' && stripeProduct.metadata) {
                    productId = stripeProduct.metadata.productId || null
                    size = stripeProduct.metadata.size || null
                }

                // Backwards-compatible fallback for sessions created before metadata was added.
                if (!productId || !size) {
                    const description = item.description || ''
                    const sizeMatch = description.match(/\(([^)]+)\)$/)
                    const parsedSize = sizeMatch ? sizeMatch[1] : null
                    const productName = description.replace(/\s\([^)]+\)$/, '').trim()

                    if (parsedSize && productName) {
                        const { data: fallbackProduct, error: fallbackError } = await supabase
                            .from('products')
                            .select('id')
                            .eq('name', productName)
                            .single()

                        if (fallbackError) throw fallbackError
                        productId = fallbackProduct.id
                        size = parsedSize
                    }
                }

                if (!productId || !size) {
                    throw new Error(`Could not identify product and size for line item ${item.id}`)
                }

                orderItems.push({
                    product_id: productId,
                    size,
                    quantity,
                    price_at_purchase: (item.amount_total || 0) / 100 / quantity,
                })
            }

            // One PostgreSQL transaction creates the order and items, locks each
            // variant, allocates available stock, and records the manufacturing gap.
            const { data: rawOrderResult, error: atomicOrderError } = await supabase.rpc(
                'create_paid_order_atomic_v2',
                {
                    p_payment_intent_id: paymentReference,
                    p_total_amount: session.amount_total ? session.amount_total / 100 : 0,
                    p_contact_email: customerEmail,
                    p_contact_phone: customerPhone,
                    p_shipping_address: shippingDetails,
                    p_items: orderItems,
                    p_coupon_code: session.metadata?.coupon_code || null,
                    p_coupon_reservation_token: session.metadata?.coupon_reservation_token || null,
                },
            )

            if (atomicOrderError) throw atomicOrderError

            const orderResult = rawOrderResult as AtomicOrderResult | null
            if (!orderResult?.order_id) {
                throw new Error(`Atomic order creation returned no order for ${session.id}`)
            }

            if (!orderResult.created) {
                console.log(`Order already exists for payment ${paymentReference}`)
                return new Response(JSON.stringify({ received: true, message: 'Order already exists' }), {
                    headers: { "Content-Type": "application/json" },
                })
            }

            if (orderResult.requires_production) {
                console.log(`Order ${orderResult.order_id} includes made-to-order units`)
            }

            // 3. Send Order Confirmation Email
            const siteUrl = Deno.env.get('SITE_URL') || 'https://hdehelena.com';
            const orderEmailApiSecret = Deno.env.get('ORDER_EMAIL_API_SECRET');
            try {
                if (!orderEmailApiSecret) {
                    throw new Error('ORDER_EMAIL_API_SECRET no está configurado');
                }

                console.log(`Solicitando email de confirmación a: ${siteUrl}/api/orders/send-status-email`);
                const emailRes = await fetch(`${siteUrl}/api/orders/send-status-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-order-email-secret': orderEmailApiSecret,
                    },
                    body: JSON.stringify({
                        orderId: orderResult.order_id,
                        status: 'paid',
                    })
                });
                
                if (!emailRes.ok) {
                    const err = await emailRes.text();
                    console.error('La API de email respondió con error:', err);
                } else {
                    console.log('Email de confirmación solicitado con éxito.');
                }
            } catch (emailErr) {
                console.error('Error de red al intentar solicitar el email de confirmación:', emailErr);
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (err: any) {
        console.error("Webhook processing error:", err)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
