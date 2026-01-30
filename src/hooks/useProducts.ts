import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, variants:product_variants(*)');

                if (error) {
                    throw error;
                }

                if (data) {
                    // Map Supabase snake_case to TypeScript camelCase
                    const mappedProducts: Product[] = data.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price), // Ensure number
                        category: item.category,
                        images: item.images || [],
                        description: item.description,
                        isHandcrafted: item.is_handcrafted,
                        isFeatured: item.is_featured,
                        featuredOrder: item.featured_order || 0,
                        materials: item.materials || [],
                        dimensions: item.dimensions,
                        variants: item.variants || []
                    }));

                    setProducts(mappedProducts);
                }
            } catch (err: any) {
                console.error('Error fetching products:', err);
                setError(err.message || 'Error loading products');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return { products, loading, error };
}
