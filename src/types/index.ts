export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'zapatos-bajos' | 'zapatos-altos' | 'botas';
  images: string[];
  description: string;
  isHandcrafted?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  materials: string[];
  dimensions?: string;
  isMadeToOrder?: boolean;
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}