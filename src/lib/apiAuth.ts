import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { supabase } from './supabase';

// Verifica que la petición venga de un usuario con sesión en el panel de admin
// (token de Supabase en el header Authorization: Bearer <token>).
export async function isAdminRequest(req: Request): Promise<boolean> {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return false;

    const token = auth.slice('Bearer '.length).trim();
    if (!token) return false;

    const { data, error } = await supabase.auth.getUser(token);
    return !error && !!data.user;
}

// Verifica la clave compartida que usa el webhook de Stripe (Supabase) para
// pedir el correo de confirmación de compra.
export function hasEmailWebhookSecret(req: Request): boolean {
    const expected = process.env.EMAIL_WEBHOOK_SECRET;
    const received = req.headers.get('x-email-webhook-secret');
    if (!expected || !received) return false;

    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
}

export function unauthorized() {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}
