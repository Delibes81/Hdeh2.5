import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Stiletto Beige Clásico',
    price: 3700,
    category: 'heels',
    images: [
      '/images/shoe1.png',
      '/images/shoe1.png'
    ],
    description: 'Elegantes zapatos de tacón beige, perfectos para cualquier ocasión formal o para elevar un look casual.',
    isHandcrafted: true,
    isFeatured: true,
    materials: ['Cuero genuino', 'Suela antideslizante'],
    dimensions: 'Tacón de 10 cm'
  },
  {
    id: '2',
    name: 'Botines de Cuero Negro',
    price: 4200,
    category: 'boots',
    images: [
      '/images/shoe2.png',
      '/images/shoe2.png'
    ],
    description: 'Botines de cuero negro con diseño minimalista y moderno. Comodidad y estilo en cada paso.',
    isHandcrafted: true,
    materials: ['Cuero premium', 'Cierre lateral'],
    dimensions: 'Tacón de 5 cm'
  },
  {
    id: '3',
    name: 'Pumps Velvet Rojo',
    price: 3500,
    category: 'heels',
    images: [
      '/images/shoe3.png',
      '/images/shoe3.png'
    ],
    description: 'Zapatos de terciopelo rojo que capturan todas las miradas. Un toque de color y sofisticación.',
    isHandcrafted: true,
    materials: ['Terciopelo de alta calidad', 'Plantilla acolchada'],
    dimensions: 'Tacón de 8 cm'
  },
  {
    id: '4',
    name: 'Sandalias de Verano',
    price: 2800,
    category: 'sandals',
    images: [
      '/images/shoe1.png',
      '/images/shoe1.png'
    ],
    description: 'Sandalias ligeras y frescas, ideales para los días soleados.',
    materials: ['Material sintético de alta calidad'],
    dimensions: 'Plataforma de 3 cm'
  },
  {
    id: '5',
    name: 'Flats Elegantes',
    price: 3100,
    category: 'flats',
    images: [
      '/images/shoe2.png',
      '/images/shoe2.png'
    ],
    description: 'Zapatos planos clásicos que combinan con todo. Un básico indispensable en tu armario.',
    isHandcrafted: true,
    materials: ['Cuero sintético', 'Detalle metálico'],
    dimensions: 'Suela plana'
  },
  {
    id: '6',
    name: 'Tacones de Fiesta',
    price: 3900,
    category: 'heels',
    images: [
      '/images/shoe3.png',
      '/images/shoe3.png'
    ],
    description: 'Brilla en tu próxima fiesta con estos espectaculares tacones.',
    materials: ['Acabado brillante', 'Correa ajustable'],
    dimensions: 'Tacón de 11 cm'
  }
];