import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { applyDiscount, bestPromotionFor, fetchActivePromotions } from '../../../lib/promotion';
import { createSlug } from '../../../utils/format';

type Props = {
    params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    // Fetch products
    const { data: products } = await supabase.from('products').select('*');
    
    if (!products) {
        return {
            title: 'Producto no encontrado | H de Helena',
        };
    }

    // Find specific product
    const product = products.find(p => createSlug(p.name) === id || p.id === id);

    if (!product) {
        return {
            title: 'Producto no encontrado | H de Helena',
        };
    }

    return {
        title: `${product.name} | H de Helena`,
        description: product.description,
        openGraph: {
            title: `${product.name} | H de Helena`,
            description: product.description,
            url: `https://hdehelena.com/shop/${id}`,
            images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
        }
    };
}

export default async function ProductLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }> | { id: string };
}) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    const { data: products } = await supabase.from('products').select('*');
    const product = products?.find(p => createSlug(p.name) === id || p.id === id);

    if (!product) return <>{children}</>;

    // Precio para Google: con descuento mientras haya promoción vigente
    const promotion = bestPromotionFor(await fetchActivePromotions(supabase), String(product.id));
    const offerPrice = promotion ? applyDiscount(Number(product.price), promotion.discountPercent) : product.price;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : 'https://hdehelena.com/images/logo.png',
        description: product.description,
        offers: {
            '@type': 'Offer',
            url: `https://hdehelena.com/shop/${id}`,
            priceCurrency: 'MXN',
            price: offerPrice,
            ...(promotion?.endsAt ? { priceValidUntil: promotion.endsAt.slice(0, 10) } : {}),
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: 'H de Helena'
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
