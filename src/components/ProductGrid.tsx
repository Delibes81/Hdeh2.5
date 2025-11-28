import { useState } from 'react';
import { products } from '../data/products';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  limit?: number;
}

export default function ProductGrid({ onAddToCart, onProductClick, limit }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'Todo' },
    { key: 'heels', label: 'Tacones' },
    { key: 'boots', label: 'Botas' },
    { key: 'flats', label: 'Flats' },
    { key: 'loafers', label: 'Mocasines' },
    { key: 'sandals', label: 'Sandalias' },
    { key: 'sneakers', label: 'Tenis' },
    { key: 'wedges', label: 'Plataformas' }
  ];

  const allFilteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  const filteredProducts = limit ? allFilteredProducts.slice(0, limit) : allFilteredProducts;

  return (
    <section id="collection" className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="font-serif font-light text-4xl lg:text-5xl text-charcoal mb-6">
            Nuestra Colección
          </h2>
          <p className="text-warm-gray text-lg lg:text-xl font-light max-w-2xl mx-auto">
            Cada pieza cuenta una historia de tradición y elegancia atemporal
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 lg:mb-20">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-6 py-2 font-medium tracking-wide transition-all duration-300 ${selectedCategory === category.key
                ? 'text-charcoal border-b border-charcoal'
                : 'text-warm-gray hover:text-charcoal'
                }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 lg:gap-16">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-16">
          <a
            href="/shop"
            className="btn-primary"
          >
            Ver Toda la Colección
          </a>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-warm-gray text-lg font-light">
              No hay productos en esta categoría
            </p>
          </div>
        )}
      </div>
    </section>
  );
}