'use client';
import { usePromotion } from '../context/PromotionContext';
import { formatPrice } from '../utils/format';

interface PriceTagProps {
    // Producto (para saber si le toca promoción)
    productId: string;
    // Precio normal (de la base de datos)
    price: number;
    // Cantidad de piezas: muestra el importe total de la línea
    quantity?: number;
    className?: string;
    // Clases para el precio con descuento / normal
    priceClassName?: string;
    // Clases para el precio tachado
    originalClassName?: string;
}

// Muestra el precio; si al producto le toca promoción, el precio normal tachado y el rebajado.
export default function PriceTag({
    productId,
    price,
    quantity = 1,
    className = '',
    priceClassName = '',
    originalClassName = '',
}: PriceTagProps) {
    const { getPromotion, getPrice } = usePromotion();

    if (!getPromotion(productId)) {
        return <span className={`${className} ${priceClassName}`}>{formatPrice(price * quantity)}</span>;
    }

    return (
        <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
            <span className={`line-through text-warm-gray/80 font-light ${originalClassName}`}>
                <span className="sr-only">Precio normal: </span>
                {formatPrice(price * quantity)}
            </span>
            <span className={`text-red-700 ${priceClassName}`}>
                <span className="sr-only">Precio con descuento: </span>
                {formatPrice(getPrice(productId, price) * quantity)}
            </span>
        </span>
    );
}
