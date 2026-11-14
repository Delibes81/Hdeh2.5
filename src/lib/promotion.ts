import type { SupabaseClient } from '@supabase/supabase-js';

// Promociones (tablas "promotions" y "promotion_products" en Supabase, ver
// promotions.sql y promotions_por_modelo.sql). Una promoción aplica a toda la
// tienda o solo a modelos seleccionados. Si a un modelo le tocan varias, se usa
// la de mayor descuento (nunca se suman).
//
// La función de pago de Stripe (supabase/functions/create-checkout-session) usa
// las mismas reglas y el mismo redondeo: si cambias algo aquí, cámbialo allá.
export interface Promotion {
    id: string;
    name: string;
    discountPercent: number;
    bannerText: string | null;
    startsAt: string;
    endsAt: string | null;
    allowCoupons: boolean;
    appliesTo: 'all' | 'selected';
    productIds: string[];
}

interface PromotionRow {
    id: string;
    name: string;
    discount_percent: number | string;
    banner_text: string | null;
    starts_at: string;
    ends_at: string | null;
    allow_coupons: boolean | null;
    applies_to?: string | null;
    promotion_products?: { product_id: string | number }[] | null;
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
        appliesTo: row.applies_to === 'selected' ? 'selected' : 'all',
        productIds: (row.promotion_products || []).map(pp => String(pp.product_id)),
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

// ¿La promoción aplica a este producto?
export function promotionAppliesTo(promotion: Promotion, productId: string): boolean {
    return promotion.appliesTo === 'all' || promotion.productIds.includes(String(productId));
}

// Promociones vigentes ahora, de mayor a menor descuento.
// Si las tablas no existen o hay un error, devuelve [] y la tienda sigue con precios normales.
export async function fetchActivePromotions(client: SupabaseClient): Promise<Promotion[]> {
    const nowIso = new Date().toISOString();
    const query = (select: string) => client
        .from('promotions')
        .select(select)
        .eq('is_active', true)
        .lte('starts_at', nowIso)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order('discount_percent', { ascending: false });

    let { data, error } = await query('*, promotion_products(product_id)');
    if (error) {
        // Sin la tabla promotion_products (SQL por modelo aún no ejecutado):
        // todas las promociones aplican a toda la tienda
        ({ data, error } = await query('*'));
    }
    if (error || !data) return [];

    return (data as unknown as PromotionRow[])
        .map(mapPromotion)
        .filter(p => isPromotionLive(p))
        // Una promoción "por modelo" sin modelos no aplica a nada
        .filter(p => p.appliesTo === 'all' || p.productIds.length > 0);
}

// La promoción que le toca a un producto (la de mayor descuento), o null.
export function bestPromotionFor(promotions: Promotion[], productId: string): Promotion | null {
    let best: Promotion | null = null;
    for (const p of promotions) {
        if (!isPromotionLive(p) || !promotionAppliesTo(p, productId)) continue;
        if (!best || p.discountPercent > best.discountPercent) best = p;
    }
    return best;
}

// Promoción que se anuncia en la franja: la de mayor descuento entre las de toda
// la tienda y las que tienen texto propio. Una promoción por modelo sin texto no
// muestra franja.
export function bannerPromotion(promotions: Promotion[]): Promotion | null {
    let best: Promotion | null = null;
    for (const p of promotions) {
        if (!isPromotionLive(p)) continue;
        if (p.appliesTo !== 'all' && !p.bannerText) continue;
        if (!best || p.discountPercent > best.discountPercent) best = p;
    }
    return best;
}

export function bannerTextFor(promotion: Promotion): string {
    return promotion.bannerText || `${promotion.discountPercent}% de descuento en toda la tienda`;
}

// Precio con descuento, redondeado a centavos igual que en Stripe.
export function applyDiscount(price: number, discountPercent: number): number {
    return Math.round(price * (100 - discountPercent)) / 100;
}
