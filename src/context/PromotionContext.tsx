'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { applyDiscount, fetchActivePromotion, isPromotionLive, Promotion } from '../lib/promotion';

interface PromotionContextType {
    // Promoción vigente en este momento, o null
    promotion: Promotion | null;
    // Precio a cobrar (con descuento si hay promoción)
    getPrice: (basePrice: number) => number;
}

const PromotionContext = createContext<PromotionContextType>({
    promotion: null,
    getPrice: (basePrice) => basePrice,
});

export function PromotionProvider({ children }: { children: ReactNode }) {
    const [loaded, setLoaded] = useState<Promotion | null>(null);
    const [, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetchActivePromotion(supabase)
            .then(p => { if (!cancelled) setLoaded(p); })
            .catch(() => { /* sin promoción: precios normales */ });
        return () => { cancelled = true; };
    }, []);

    // Si la promoción termina mientras la página está abierta, se vuelve a pintar
    useEffect(() => {
        if (!loaded?.endsAt) return;
        const ms = new Date(loaded.endsAt).getTime() - Date.now();
        if (ms <= 0 || ms > 2_147_000_000) return;
        const t = setTimeout(() => setTick(n => n + 1), ms + 1000);
        return () => clearTimeout(t);
    }, [loaded]);

    const promotion = isPromotionLive(loaded) ? loaded : null;

    const getPrice = useCallback(
        (basePrice: number) => (promotion ? applyDiscount(basePrice, promotion.discountPercent) : basePrice),
        [promotion]
    );

    return (
        <PromotionContext.Provider value={{ promotion, getPrice }}>
            {children}
        </PromotionContext.Provider>
    );
}

export function usePromotion() {
    return useContext(PromotionContext);
}
