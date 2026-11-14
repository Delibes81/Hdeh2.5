'use client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    applyDiscount,
    bannerPromotion,
    bestPromotionFor,
    fetchActivePromotions,
    isPromotionLive,
    Promotion,
} from '../lib/promotion';

interface PromotionContextType {
    // Promociones vigentes en este momento
    promotions: Promotion[];
    // Promoción que se anuncia en la franja, o null
    banner: Promotion | null;
    // Promoción que le toca a un producto (la de mayor descuento), o null
    getPromotion: (productId: string) => Promotion | null;
    // Precio a cobrar por un producto (con descuento si le toca promoción)
    getPrice: (productId: string, basePrice: number) => number;
}

const PromotionContext = createContext<PromotionContextType>({
    promotions: [],
    banner: null,
    getPromotion: () => null,
    getPrice: (_productId, basePrice) => basePrice,
});

export function PromotionProvider({ children }: { children: ReactNode }) {
    const [loaded, setLoaded] = useState<Promotion[]>([]);
    const [, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = () => {
            fetchActivePromotions(supabase)
                .then(p => { if (!cancelled) setLoaded(p); })
                .catch(() => { /* sin promociones: precios normales */ });
        };
        load();

        // Si se cambia una promoción en el panel, las páginas abiertas se
        // actualizan al volver a la pestaña o cada 5 minutos
        const onVisible = () => { if (document.visibilityState === 'visible') load(); };
        document.addEventListener('visibilitychange', onVisible);
        const interval = setInterval(load, 5 * 60 * 1000);
        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', onVisible);
            clearInterval(interval);
        };
    }, []);

    // Si una promoción termina mientras la página está abierta, se vuelve a pintar
    useEffect(() => {
        const ends = loaded
            .map(p => (p.endsAt ? new Date(p.endsAt).getTime() - Date.now() : -1))
            .filter(ms => ms > 0 && ms < 2_147_000_000);
        if (ends.length === 0) return;
        const t = setTimeout(() => setTick(n => n + 1), Math.min(...ends) + 1000);
        return () => clearTimeout(t);
    }, [loaded]);

    const promotions = loaded.filter(p => isPromotionLive(p));

    const getPromotion = (productId: string) => bestPromotionFor(promotions, productId);

    const getPrice = (productId: string, basePrice: number) => {
        const promotion = getPromotion(productId);
        return promotion ? applyDiscount(basePrice, promotion.discountPercent) : basePrice;
    };

    return (
        <PromotionContext.Provider value={{ promotions, banner: bannerPromotion(promotions), getPromotion, getPrice }}>
            {children}
        </PromotionContext.Provider>
    );
}

export function usePromotion() {
    return useContext(PromotionContext);
}
