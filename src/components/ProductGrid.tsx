import { useState } from 'react';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  limit?: number;
}

export default function ProductGrid({ onAddToCart, onProductClick, limit }: ProductGridProps) {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { elementRef, isVisible } = useIntersectionObserver();
  const { elementRef: gridRef, isVisible: isGridVisible } = useIntersectionObserver({ threshold: 0.1 });

  const categories = [
    { key: 'all', label: 'Todo' },
    { key: 'zapatos-bajos', label: 'Zapatos bajos' },
    { key: 'zapatos-altos', label: 'Zapatos Altos' },
    { key: 'botas', label: 'Botas' }
  ];

  if (loading) {
    return <div className="py-24 text-center">Cargando productos...</div>;
  }

  const allFilteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  // If a limit is set (like on Home page), prioritize featured products and sort them by order
  const productsToDisplay = limit
    ? allFilteredProducts
      .filter(p => p.isFeatured)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
      .concat(allFilteredProducts.filter(p => !p.isFeatured))
      .slice(0, limit)
    : allFilteredProducts;

  const filteredProducts = productsToDisplay;

  return (
    <section id="collection" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={elementRef}
          className={`text-center mb-8 lg:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h2 className="font-serif font-light text-4xl lg:text-5xl text-charcoal mb-0">
            NUESTRA COLECCIÓN
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 lg:mb-12">
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
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-16">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              startAnimation={isGridVisible}
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