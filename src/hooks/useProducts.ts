import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { getErrorMessage } from '../utils/errors';
import { mapProductRow, type ProductRow } from '../utils/products';

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
                    const mappedProducts: Product[] = data.map((item) =>
                        mapProductRow(item as ProductRow)
                    );

                    setProducts(mappedProducts);
                }
            } catch (err: unknown) {
                console.error('Error fetching products:', err);
                setError(getErrorMessage(err, 'Error loading products'));
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return { products, loading, error };
}
