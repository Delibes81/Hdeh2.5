import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { createSlug, formatPrice } from '../../../utils/format';
import ProductClient from './ProductClient';
import { Product } from '../../../types';
import { mapProductRow, type ProductRow } from '../../../utils/products';

async function getProduct(id: string): Promise<Product | null> {
    const { data: rawProducts, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)');
        
    if (error || !rawProducts) {
        console.error('Error fetching product:', error);
        return null;
    }

    const rawProduct = rawProducts.find((product) => createSlug(product.name) === id || product.id === id);
    if (!rawProduct) return null;

    return mapProductRow(rawProduct as ProductRow);
}

const getCategoryInfo = (category: string | null | undefined) => {
    const categoryDisplayNames: Record<string, string> = {
        'zapatos-altos': 'Zapatos Altos',
        'zapatos-bajos': 'Zapatos Bajos',
        'botas': 'Botas',
    };
    const displayName = (category && categoryDisplayNames[category]) || 'Calzado';
    const slug = category || 'calzado';
    return {
        name: displayName,
        url: `https://hdehelena.com/shop?category=${slug}`,
    };
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Producto No Encontrado | H de Helena',
        };
    }

    const formattedPrice = formatPrice(product.price);

    return {
        title: `${product.name} | H de Helena`,
        description: product.description || `Compra ${product.name} por ${formattedPrice} en H de Helena. Zapatos de piel artesanales.`,
        openGraph: {
            title: `${product.name} | H de Helena`,
            description: product.description || `Compra ${product.name} por ${formattedPrice} en H de Helena. Zapatos de piel artesanales.`,
            type: 'website',
            images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
        }
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const product = await getProduct(id);

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-24">
                <div className="text-center">
                    <h1 className="font-serif text-3xl mb-4 text-charcoal">Producto no encontrado</h1>
                    <p className="text-warm-gray mb-6">El producto que buscas no existe o ha sido removido.</p>
                    <a href="/shop" className="btn-primary inline-block">Volver a la tienda</a>
                </div>
            </div>
        );
    }

    const categoryInfo = getCategoryInfo(product.category);

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Inicio',
                'item': 'https://hdehelena.com'
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Tienda',
                'item': 'https://hdehelena.com/shop'
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': categoryInfo.name,
                'item': categoryInfo.url
            },
            {
                '@type': 'ListItem',
                'position': 4,
                'name': product.name,
                'item': `https://hdehelena.com/shop/${id}`
            }
        ]
    };

    const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'image': product.images && product.images.length > 0 ? product.images[0] : 'https://hdehelena.com/images/logo.png',
        'description': product.description || `Compra ${product.name} en H de Helena. Zapatos de piel artesanales.`,
        'offers': {
            '@type': 'Offer',
            'url': `https://hdehelena.com/shop/${id}`,
            'priceCurrency': 'MXN',
            'price': product.price,
            'itemCondition': 'https://schema.org/NewCondition',
            'availability': 'https://schema.org/InStock',
            'seller': {
                '@type': 'Organization',
                'name': 'H de Helena'
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <ProductClient initialProduct={product} />
        </>
    );
}
