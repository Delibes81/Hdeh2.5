import type { SupabaseClient } from '@supabase/supabase-js';

// Promoción de toda la tienda (tabla "promotions" en Supabase, ver promotions.sql).
// La función de pago de Stripe (supabase/functions/create-checkout-session) usa
// la misma consulta y el mismo redondeo: si cambias algo aquí, cámbialo allá.
export interface Promotion {
    id: string;
    name: string;
    discountPercent: number;
    bannerText: string | null;
    startsAt: string;
    endsAt: string | null;
    allowCoupons: boolean;
}

interface PromotionRow {
    id: string;
    name: string;
    discount_percent: number | string;
    banner_text: string | null;
    starts_at: string;
    ends_at: string | null;
    allow_coupons: boolean | null;
}

function mapPromotion(row: PromotionRow): Promotion {
    return {
        id: row.id,
        name: row.name,
        discountPercent: Number(row.discount_percent),
        bannerText: row.banner_text,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        allowCoupons: !!row.allow_coupons,
    };
}

// ¿La promoción está vigente en este momento?
export function isPromotionLive(promotion: Promotion | null, now = Date.now()): promotion is Promotion {
    if (!promotion) return false;
    if (!(promotion.discountPercent > 0 && promotion.discountPercent < 100)) return false;
    if (new Date(promotion.startsAt).getTime() > now) return false;
    if (promotion.endsAt && new Date(promotion.endsAt).getTime() <= now) return false;
    return true;
}

// Busca la promoción vigente (la de mayor descuento si hubiera varias).
// Si la tabla no existe o hay un error, devuelve null y la tienda sigue con precios normales.
export async function fetchActivePromotion(client: SupabaseClient): Promise<Promotion | null> {
    const nowIso = new Date().toISOString();
    const { data, error } = await client
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', nowIso)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order('discount_percent', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) return null;
    const promotion = mapPromotion(data[0] as PromotionRow);
    return isPromotionLive(promotion) ? promotion : null;
}

// Precio con descuento, redondeado a centavos igual que en Stripe.
export function applyDiscount(price: number, discountPercent: number): number {
    return Math.round(price * (100 - discountPercent)) / 100;
}
