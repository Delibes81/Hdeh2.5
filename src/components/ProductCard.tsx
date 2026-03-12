import { useState } from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils/format';

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
        className="relative aspect-[4/5] overflow-hidden bg-white flex flex-col justify-end"
        onMouseEnter={handleImageChange}
      >
        <img
          src={product.images[imageIndex]}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
        />



        {/* Add to Cart Button - appears on hover */}

      </div>

      {/* Product Info */}
      <div className="space-y-1 text-center mt-4">
        <h3 className="font-montserrat uppercase text-sm lg:text-base tracking-wide text-charcoal group-hover:text-warm-gray transition-colors duration-300">
          {product.name}
        </h3>

        <p className="font-sans uppercase text-warm-gray font-light text-xs lg:text-sm">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}