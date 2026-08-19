import type { Product, ProductVariant } from '../types';

export interface ProductRow {
  id: string;
  name: string;
  price: number | string;
  category: Product['category'];
  images?: string[] | null;
  description?: string | null;
  is_handcrafted?: boolean | null;
  is_featured?: boolean | null;
  featured_order?: number | null;
  materials?: string[] | null;
  dimensions?: string | null;
  is_made_to_order?: boolean | null;
  variants?: ProductVariant[] | null;
}

export function mapProductRow(item: ProductRow): Product {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category: item.category,
    images: item.images ?? [],
    description: item.description ?? '',
    isHandcrafted: item.is_handcrafted ?? undefined,
    isFeatured: item.is_featured ?? undefined,
    featuredOrder: item.featured_order ?? 0,
    materials: item.materials ?? [],
    dimensions: item.dimensions ?? undefined,
    isMadeToOrder: item.is_made_to_order ?? undefined,
    variants: item.variants ?? [],
  };
}
