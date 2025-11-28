export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'heels' | 'boots' | 'flats' | 'sandals' | 'sneakers' | 'wedges' | 'loafers';
  images: string[];
  description: string;
  isHandcrafted?: boolean;
  isFeatured?: boolean;
  materials: string[];
  dimensions?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}