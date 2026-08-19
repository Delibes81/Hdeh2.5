export type MetaPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export interface MetaPixelContent {
  id: string;
  quantity: number;
  item_price?: number;
}

export interface MetaPixelParameters {
  content_ids?: string[];
  content_name?: string;
  content_type?: 'product';
  contents?: MetaPixelContent[];
  currency?: 'MXN';
  num_items?: number;
  value?: number;
}

export interface PendingMetaPurchase extends MetaPixelParameters {
  currency: 'MXN';
  value: number;
}

interface MetaPixelFunction {
  (...args: unknown[]): void;
}

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

const pendingEvents: Array<{ event: MetaPixelEvent; parameters?: MetaPixelParameters }> = [];

export const META_PENDING_PURCHASE_KEY = 'hdehelena-meta-pending-purchase';

const isConfigured = () => Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());

export function trackMetaEvent(event: MetaPixelEvent, parameters?: MetaPixelParameters) {
  if (typeof window === 'undefined' || !isConfigured()) return;

  if (window.fbq) {
    if (parameters) {
      window.fbq('track', event, parameters);
    } else {
      window.fbq('track', event);
    }
    return;
  }

  pendingEvents.push({ event, parameters });
}

export function flushMetaEvents() {
  if (typeof window === 'undefined' || !window.fbq) return;

  while (pendingEvents.length > 0) {
    const pendingEvent = pendingEvents.shift();
    if (pendingEvent) {
      if (pendingEvent.parameters) {
        window.fbq('track', pendingEvent.event, pendingEvent.parameters);
      } else {
        window.fbq('track', pendingEvent.event);
      }
    }
  }
}

export function savePendingMetaPurchase(purchase: PendingMetaPurchase) {
  if (typeof window === 'undefined' || !isConfigured()) return;
  sessionStorage.setItem(META_PENDING_PURCHASE_KEY, JSON.stringify(purchase));
}

export function readPendingMetaPurchase(): PendingMetaPurchase | null {
  if (typeof window === 'undefined') return null;

  const storedPurchase = sessionStorage.getItem(META_PENDING_PURCHASE_KEY);
  if (!storedPurchase) return null;

  try {
    const purchase = JSON.parse(storedPurchase) as PendingMetaPurchase;
    if (purchase.currency !== 'MXN' || !Number.isFinite(purchase.value) || purchase.value < 0) {
      return null;
    }
    return purchase;
  } catch {
    return null;
  }
}

export function clearPendingMetaPurchase() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(META_PENDING_PURCHASE_KEY);
}
