import { MetadataRoute } from 'next';
import { supabase } from '../lib/supabase';
import { createSlug } from '../utils/format';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://hdehelena.com';
    const buildDate = new Date('2026-05-26');

    const staticUrls = [
        {
            url: `${baseUrl}/`,
            lastModified: buildDate,
            changeFrequency: 'weekly' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: buildDate,
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: buildDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/shipping`,
            lastModified: buildDate,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/returns`,
            lastModified: buildDate,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/care`,
            lastModified: buildDate,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: buildDate,
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: buildDate,
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
    ];

    try {
        // Fetch products
        const { data: products, error } = await supabase.from('products').select('name, created_at');

        if (error) {
            console.error('Error fetching products for sitemap:', error);
            return staticUrls;
        }

        // Map products to sitemap entries
        const productUrls = products?.map((product) => ({
            url: `${baseUrl}/shop/${createSlug(product.name)}`,
            lastModified: product.created_at ? new Date(product.created_at) : buildDate,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })) ?? [];

        return [...staticUrls, ...productUrls];
    } catch (err) {
        console.error('Unexpected error generating sitemap:', err);
        return staticUrls;
    }
}
