import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { createSlug } from '../../../utils/format';
import ProductClient from './ProductClient';

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const { data: products } = await supabase.from('products').select('id, name, description, images');
    
    const product = products?.find((p: any) => createSlug(p.name) === id || p.id === id);

    if (!product) {
        return {
            title: 'Producto No Encontrado | H de Helena',
        };
    }

    return {
        title: `${product.name} | H de Helena`,
        description: product.description || `Compra ${product.name} en H de Helena. Zapatos de piel artesanales.`,
        openGraph: {
            title: `${product.name} | H de Helena`,
            description: product.description || `Compra ${product.name} en H de Helena. Zapatos de piel artesanales.`,
            type: 'website',
            images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
        }
    };
}

export default function ProductPage() {
    return <ProductClient />;
}
