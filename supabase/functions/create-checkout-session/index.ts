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
        const { items, success_url, cancel_url } = await req.json()
        console.log("Received Checkout Request:", { items: items.length })

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

            if (variant.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${item.size}). Available: ${variant.stock}`)
            }

            lineItems.push({
                price_data: {
                    currency: 'mxn',
                    product_data: {
                        name: `${product.name} (${item.size})`,
                        description: product.description ? product.description.substring(0, 100) : undefined,
                        images: product.images ? product.images.slice(0, 1) : [],
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

        console.log("Creating Stripe Session...")
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
            shipping_address_collection: {
                allowed_countries: ['MX'],
            },
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
