import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
// Los cupones ya no son legibles públicamente: se consultan con la service role key
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

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

        // Promociones vigentes (tablas promotions y promotion_products). Mismas reglas y
        // mismo redondeo que src/lib/promotion.ts en la página: si cambias uno, cambia el otro.
        // - Una promoción aplica a toda la tienda ('all') o a modelos elegidos ('selected').
        // - A cada modelo le toca la de mayor descuento (nunca se suman).
        const nowIso = new Date().toISOString()
        const promoQuery = (select: string) => supabase
            .from('promotions')
            .select(select)
            .eq('is_active', true)
            .lte('starts_at', nowIso)
            .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
            .order('discount_percent', { ascending: false })
        let { data: promoRows, error: promoError } = await promoQuery('*, promotion_products(product_id)')
        if (promoError) {
            // Sin la tabla promotion_products: todas aplican a toda la tienda
            ({ data: promoRows, error: promoError } = await promoQuery('*'))
        }
        const promotions = (promoRows || [])
            .map((row: any) => ({
                name: String(row.name),
                percent: Number(row.discount_percent),
                allowCoupons: row.allow_coupons === true,
                appliesTo: row.applies_to === 'selected' ? 'selected' : 'all',
                productIds: (row.promotion_products || []).map((pp: any) => String(pp.product_id)),
            }))
            .filter((p: any) => p.percent > 0 && p.percent < 100)
            .filter((p: any) => p.appliesTo === 'all' || p.productIds.length > 0)

        const bestPromotionFor = (productId: string) => {
            let best: any = null
            for (const p of promotions) {
                if (p.appliesTo !== 'all' && !p.productIds.includes(String(productId))) continue
                if (!best || p.percent > best.percent) best = p
            }
            return best
        }
        if (promotions.length > 0) {
            console.log('Promociones vigentes:', promotions.map((p: any) => `${p.name} (${p.percent}%, ${p.appliesTo})`).join(', '))
        }
        const usedPromotions = new Map<string, any>()

        const formatMxn = (amount: number) =>
            new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)

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

            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                throw new Error(`Cantidad inválida para ${product.name}`)
            }

            const { data: variant, error: varError } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', item.productId)
                .eq('size', item.size)
                .maybeSingle()

            if (varError) throw varError

            // Producto "sobre pedido" (columna is_made_to_order): se puede pagar
            // aunque la talla no esté registrada o no tenga stock.
            const isMadeToOrderProduct = product.is_made_to_order === true

            if (!variant && !isMadeToOrderProduct) {
                throw new Error(`Variant not found available: ${product.name} - ${item.size}`)
            }

            // Una talla sin piezas (stock 0 o menos) se vende sobre pedido;
            // si tiene piezas, no se pueden pedir más de las que hay.
            if (variant && !isMadeToOrderProduct && variant.stock > 0 && variant.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${item.size}). Available: ${variant.stock}`)
            }

            // Fix Image URL (Stripe requires absolute URL)
            let imageUrl = product.images?.[0];
            if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = `${origin}${imageUrl}`;
            }

            // Precio en centavos (con descuento si al modelo le toca promoción)
            const basePrice = Number(product.price)
            const promotion = bestPromotionFor(product.id)
            if (promotion) usedPromotions.set(promotion.name, promotion)
            const unitAmount = promotion
                ? Math.round(basePrice * (100 - promotion.percent))
                : Math.round(basePrice * 100)

            const description = promotion
                ? `${promotion.percent}% de descuento · Precio normal ${formatMxn(basePrice)}`
                : (product.description ? product.description.substring(0, 100) : undefined)

            lineItems.push({
                price_data: {
                    currency: 'mxn',
                    product_data: {
                        name: `${product.name} (${item.size})`,
                        description,
                        images: imageUrl ? [imageUrl] : [],
                        metadata: {
                            productId: product.id,
                            size: item.size
                        }
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            })
        }

        let stripeCouponId = undefined;
        let appliedCouponCode: string | undefined = undefined;
        // Si algún modelo del carrito tiene una promoción que no permite cupones,
        // el cupón no aplica a todo el carrito
        const couponsAllowed = [...usedPromotions.values()].every((p: any) => p.allowCoupons)
        if (couponCode && !couponsAllowed) {
            console.log(`Cupón ${couponCode} ignorado: el carrito tiene modelos con una promoción que no permite cupones`)
        }
        if (couponCode && couponsAllowed) {
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
            const { data: coupon, error: couponError } = await supabaseAdmin
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
                    appliedCouponCode = coupon.code;
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
            // El webhook usa este dato para contar el uso del cupón
            metadata: {
                ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
                ...(usedPromotions.size > 0
                    ? { promotions: [...usedPromotions.values()].map((p: any) => `${p.name} (${p.percent}%)`).join(', ').slice(0, 500) }
                    : {}),
            },
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
