import { sendGAEvent } from '@next/third-parties/google';

// ID del pixel de Meta: se configura en Vercel con NEXT_PUBLIC_META_PIXEL_ID.
// Solo se aceptan dígitos para evitar inyectar texto en el script del pixel.
const rawPixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim();
export const META_PIXEL_ID = /^\d+$/.test(rawPixelId) ? rawPixelId : '';

type FbqParams = Record<string, unknown>;

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

// Envía un evento estándar al pixel de Meta. Si el script del pixel aún no
// terminó de cargar, reintenta unos segundos antes de rendirse.
export function trackMeta(event: string, params?: FbqParams, eventId?: string, attempt = 0) {
    if (!META_PIXEL_ID || typeof window === 'undefined') return;

    if (typeof window.fbq === 'function') {
        if (eventId) {
            window.fbq('track', event, params || {}, { eventID: eventId });
        } else {
            window.fbq('track', event, params || {});
        }
        return;
    }

    if (attempt < 20) {
        setTimeout(() => trackMeta(event, params, eventId, attempt + 1), 250);
    }
}

// ---- Compra: se guardan los datos del carrito antes de ir a Stripe y se
// registra la compra al volver a la página de gracias ----

export interface PurchaseItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
}

interface PendingPurchase {
    value: number;
    items: PurchaseItem[];
    coupon?: string;
    savedAt: number;
}

const PENDING_KEY = 'hdeh_pending_purchase';
const TRACKED_KEY = 'hdeh_tracked_purchases';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // un día

export function trackBeginCheckout(value: number, items: PurchaseItem[], coupon?: string) {
    const numItems = items.reduce((sum, i) => sum + i.quantity, 0);

    trackMeta('InitiateCheckout', {
        value,
        currency: 'MXN',
        num_items: numItems,
        content_ids: items.map(i => i.id),
        content_type: 'product',
    });

    sendGAEvent('event', 'begin_checkout', {
        currency: 'MXN',
        value,
        coupon,
        items: items.map(i => ({
            item_id: i.id,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity,
            item_variant: i.size,
        })),
    });

    try {
        const pending: PendingPurchase = { value, items, coupon, savedAt: Date.now() };
        localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {
        // Sin almacenamiento disponible: la compra no se podrá registrar
    }
}

// Registra la compra una sola vez por sesión de pago de Stripe.
export function trackPurchaseFromPending(stripeSessionId: string | null) {
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) return;
        localStorage.removeItem(PENDING_KEY);

        const pending = JSON.parse(raw) as PendingPurchase;
        if (!pending || Date.now() - pending.savedAt > MAX_AGE_MS) return;

        const transactionId = stripeSessionId || `local-${pending.savedAt}`;
        const tracked: string[] = JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]');
        if (tracked.includes(transactionId)) return;
        localStorage.setItem(TRACKED_KEY, JSON.stringify([...tracked, transactionId].slice(-20)));

        trackMeta(
            'Purchase',
            {
                value: pending.value,
                currency: 'MXN',
                num_items: pending.items.reduce((sum, i) => sum + i.quantity, 0),
                content_ids: pending.items.map(i => i.id),
                content_type: 'product',
            },
            transactionId
        );

        sendGAEvent('event', 'purchase', {
            transaction_id: transactionId,
            currency: 'MXN',
            value: pending.value,
            coupon: pending.coupon,
            items: pending.items.map(i => ({
                item_id: i.id,
                item_name: i.name,
                price: i.price,
                quantity: i.quantity,
                item_variant: i.size,
            })),
        });
    } catch {
        // Datos guardados inválidos o almacenamiento bloqueado: no se registra
    }
}
