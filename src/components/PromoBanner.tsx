'use client';
import { usePromotion } from '../context/PromotionContext';
import { bannerTextFor } from '../lib/promotion';

const REPEAT = 8;

// Franja de la promoción vigente, arriba del encabezado, con el texto en movimiento.
// Si el usuario pidió reducir el movimiento en su sistema, el texto queda fijo.
export default function PromoBanner() {
    const { banner } = usePromotion();
    if (!banner) return null;

    const text = bannerTextFor(banner);
    const items = Array.from({ length: REPEAT }, (_, i) => (
        <span key={i} className="flex items-center shrink-0">
            <span className="px-6">{text}</span>
            <span aria-hidden="true" className="opacity-50">✦</span>
        </span>
    ));

    return (
        <div className="promo-marquee h-8 bg-charcoal text-cream overflow-hidden flex items-center" role="region" aria-label="Promoción">
            <span className="sr-only">{text}</span>
            {/* Dos copias idénticas: la animación recorre una y vuelve a empezar sin salto */}
            <div
                className="promo-marquee-track flex w-max font-montserrat text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
                style={{ animationDuration: `${Math.max(15, Math.round(text.length * REPEAT * 0.09))}s` }}
                aria-hidden="true"
            >
                <div className="flex">{items}</div>
                <div className="flex">{items}</div>
            </div>
            {/* Texto fijo para quien prefiere menos movimiento */}
            <p className="promo-marquee-static hidden w-full px-4 text-center font-montserrat text-[10px] sm:text-xs uppercase tracking-widest truncate" aria-hidden="true">
                {text}
            </p>
        </div>
    );
}

// Altura de la franja (h-8), para empujar el contenido debajo del encabezado fijo.
export function PromoBannerSpacer() {
    const { banner } = usePromotion();
    if (!banner) return null;
    return <div className="h-8" aria-hidden="true" />;
}
