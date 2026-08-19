import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { items, success_url, cancel_url, couponCode } = await req.json()
        console.log("Received Checkout Request:", { items: items.length, couponCode })

        // Extract origin to fix relative paths
        // success_url usually looks like "https://domain.com/success"
        const origin = new URL(success_url).origin

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const lineItems = []

        for (const item of items) {
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

            const isMTO = product.isMadeToOrder || variant.stock === 0;
            if (!isMTO && variant.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${item.size}). Available: ${variant.stock}`)
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

        let stripeCouponId = undefined;
        if (couponCode) {
            const { data: coupon, error: couponError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();
                
            if (!couponError && coupon) {
                if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
                    console.log("Creating ephemeral Stripe coupon for:", coupon.code);
                    const stripeCoupon = await stripe.coupons.create({
                        percent_off: coupon.discount_type === 'percentage' ? Number(coupon.discount_value) : undefined,
                        amount_off: coupon.discount_type === 'fixed' ? Math.round(Number(coupon.discount_value) * 100) : undefined,
                        currency: coupon.discount_type === 'fixed' ? 'mxn' : undefined,
                        duration: 'once',
                        name: coupon.code
                    });
                    stripeCouponId = stripeCoupon.id;
                }
            }
        }

        console.log("Creating Stripe Session...")
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            locale: 'es-419',
            line_items: lineItems,
            mode: 'payment',
            discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
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
    } catch (error: any) {
        console.error("Function Error:", error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }
})
