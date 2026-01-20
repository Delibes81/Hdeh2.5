import { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onProductClick: (product: Product) => void;
  index?: number;
  startAnimation?: boolean;
}

export default function ProductCard({ product, onAddToCart, onProductClick, index = 0, startAnimation = true }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageChange = () => {
    if (product.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  return (
    <div
      className={`group cursor-pointer opacity-0 fill-mode-forwards ${startAnimation ? 'animate-fade-in-up' : ''}`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
    >
      {/* Product Image */}
      <div
        className="relative aspect-[4/5] mb-6 overflow-hidden bg-stone/10"
        onMouseEnter={handleImageChange}
      >
        <img
          src={product.images[imageIndex]}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
        />

        {/* Handcrafted Badge */}
        {product.isHandcrafted && (
          <div className="absolute top-4 left-4">
            <span className="bg-cream/90 text-charcoal px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-sm">
              Artesanal
            </span>
          </div>
        )}

        {/* Add to Cart Button - appears on hover */}

      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-serif font-light text-xl lg:text-2xl text-charcoal group-hover:text-warm-gray transition-colors duration-300">
          {product.name}
        </h3>

        <p className="text-warm-gray font-light text-base">
          ${product.price}
        </p>
      </div>
    </div>
  );
}