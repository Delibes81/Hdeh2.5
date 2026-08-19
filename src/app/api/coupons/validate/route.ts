import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isCouponUsageAvailable } from '../../../../utils/coupons';

type CouponRow = {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number | string;
    usage_limit: number | null;
    used_count: number | null;
};

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null) as { code?: unknown } | null;
        const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';

        if (!code || code.length > 64) {
            return NextResponse.json(
                { valid: false, error: 'Cupón inválido o inactivo' },
                { headers: noStoreHeaders },
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Coupon validation is missing Supabase server credentials');
            return NextResponse.json(
                { valid: false, error: 'No se pudo validar el cupón' },
                { status: 500, headers: noStoreHeaders },
            );
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await supabase
            .from('coupons')
            .select('id, code, discount_type, discount_value, usage_limit, used_count')
            .eq('code', code)
            .eq('is_active', true)
            .maybeSingle<CouponRow>();

        if (error) throw error;

        if (!data) {
            return NextResponse.json(
                { valid: false, error: 'Cupón inválido o inactivo' },
                { headers: noStoreHeaders },
            );
        }

        if (data.usage_limit !== null) {
            const { count, error: reservationsError } = await supabase
                .from('coupon_reservations')
                .select('*', { count: 'exact', head: true })
                .eq('coupon_id', data.id)
                .eq('status', 'reserved')
                .gt('expires_at', new Date().toISOString());

            if (reservationsError) throw reservationsError;

            if (!isCouponUsageAvailable(data.usage_limit, data.used_count, count)) {
                return NextResponse.json(
                    { valid: false, error: 'Este cupón ha alcanzado su límite de uso' },
                    { headers: noStoreHeaders },
                );
            }
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: data.code,
                discountType: data.discount_type,
                discountValue: Number(data.discount_value),
            },
        }, { headers: noStoreHeaders });
    } catch (error) {
        console.error('Coupon validation failed:', error);
        return NextResponse.json(
            { valid: false, error: 'No se pudo validar el cupón' },
            { status: 500, headers: noStoreHeaders },
        );
    }
}
