'use client';
import { usePromotion } from '../context/PromotionContext';

// Franja de la promoción vigente, arriba del encabezado.
export default function PromoBanner() {
    const { promotion } = usePromotion();
    if (!promotion) return null;

    const text = promotion.bannerText || `${promotion.discountPercent}% de descuento en toda la tienda`;
    // En celular solo cabe la primera parte (antes de " · ")
    const shortText = text.split(' · ')[0];

    return (
        <div className="h-8 bg-charcoal text-cream flex items-center justify-center px-4 text-center">
            <p className="font-montserrat text-[10px] sm:text-xs uppercase tracking-widest truncate">
                <span className="sm:hidden">{shortText}</span>
                <span className="hidden sm:inline">{text}</span>
            </p>
        </div>
    );
}

// Altura de la franja (h-8), para empujar el contenido debajo del encabezado fijo.
export function PromoBannerSpacer() {
    const { promotion } = usePromotion();
    if (!promotion) return null;
    return <div className="h-8" aria-hidden="true" />;
}
