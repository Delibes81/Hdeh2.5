import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

type ReservedCoupon = {
    valid: boolean
    reason?: 'invalid' | 'usage_limit'
    code?: string
    discount_type?: 'percentage' | 'fixed'
    discount_value?: number | string
}

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    let reservationToken: string | null = null

    try {
        const { items, success_url, cancel_url, couponCode } = await req.json()

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('At least one checkout item is required')
        }

        console.log("Received Checkout Request:", { items: items.length, couponCode })

        // Extract origin to fix relative paths
        // success_url usually looks like "https://domain.com/success"
        const origin = new URL(success_url).origin

        const lineItems = []

        for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new Error('Item quantity must be a positive integer')
            }

            const { data: product, error: prodError } = await supabase
                .from('products')
                .select('*')
                .eq('id', item.productId)
                .single()

            if (prodError || !product) {
                throw new Error(`Product not found: ${item.productId}`)
            }

            const { data: variant, error: varError } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', item.productId)
                .eq('size', item.size)
                .single()

            if (varError || !variant) {
                throw new Error(`Variant not found available: ${product.name} - ${item.size}`)
            }

            // Fix Image URL (Stripe requires absolute URL)
            let imageUrl = product.images?.[0];
            if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = `${origin}${imageUrl}`;
            }

            lineItems.push({
                price_data: {
                    currency: 'mxn',
                    product_data: {
                        name: `${product.name} (${item.size})`,
                        description: product.description ? product.description.substring(0, 100) : undefined,
                        images: imageUrl ? [imageUrl] : [],
                        metadata: {
                            productId: product.id,
                            size: item.size
                        }
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: item.quantity,
            })
        }

        let stripeCouponId: string | undefined;
        let couponCodeForSession: string | undefined;
        if (couponCode) {
            reservationToken = crypto.randomUUID()
            const reservationExpiresAt = new Date(Date.now() + 36 * 60 * 1000).toISOString()
            const { data: rawCoupon, error: couponError } = await supabase.rpc(
                'reserve_coupon_for_checkout',
                {
                    p_code: String(couponCode),
                    p_reservation_token: reservationToken,
                    p_expires_at: reservationExpiresAt,
                },
            )

            if (couponError) throw couponError

            const coupon = rawCoupon as ReservedCoupon | null
            if (!coupon?.valid || !coupon.code || !coupon.discount_type) {
                throw new Error(coupon?.reason === 'usage_limit'
                    ? 'Este cupón ha alcanzado su límite de uso'
                    : 'Cupón inválido o inactivo')
            }

            console.log("Creating Stripe coupon for reserved code:", coupon.code);
            const stripeCoupon = await stripe.coupons.create({
                percent_off: coupon.discount_type === 'percentage' ? Number(coupon.discount_value) : undefined,
                amount_off: coupon.discount_type === 'fixed' ? Math.round(Number(coupon.discount_value) * 100) : undefined,
                currency: coupon.discount_type === 'fixed' ? 'mxn' : undefined,
                duration: 'once',
                name: coupon.code
            });
            stripeCouponId = stripeCoupon.id;
            couponCodeForSession = coupon.code;
        }

        console.log("Creating Stripe Session...")
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            locale: 'es-419',
            line_items: lineItems,
            mode: 'payment',
            metadata: {
                source: 'hdehelena-store',
                ...(couponCodeForSession && reservationToken ? {
                    coupon_code: couponCodeForSession,
                    coupon_reservation_token: reservationToken,
                } : {}),
            },
            discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
            expires_at: Math.floor(Date.now() / 1000) + (31 * 60),
            success_url: success_url,
            cancel_url: cancel_url,
            shipping_address_collection: {
                allowed_countries: ['MX'],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'mxn',
                        },
                        display_name: 'Envío Estándar (Todo México)',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 3,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 5,
                            },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 10000, // 100 MXN
                            currency: 'mxn',
                        },
                        display_name: 'Entrega Día Siguiente (Solo CDMX)',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 1,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 1,
                            },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 25000, // 250 MXN
                            currency: 'mxn',
                        },
                        display_name: 'Entrega Día Siguiente (Foráneo / Afueras de CDMX)',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 1,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 1,
                            },
                        },
                    },
                },
            ],
            phone_number_collection: {
                enabled: true,
            },
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error: unknown) {
        if (reservationToken) {
            const { error: releaseError } = await supabase.rpc('release_coupon_reservation', {
                p_reservation_token: reservationToken,
            })

            if (releaseError) {
                console.error('Could not release coupon reservation:', releaseError)
            }
        }

        const errorMessage = error instanceof Error ? error.message : 'No se pudo iniciar el pago'
        console.error("Function Error:", error)
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }
})
