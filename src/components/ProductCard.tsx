import { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageChange = () => {
    if (product.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  return (
    <div
      className="group cursor-pointer"
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
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        <div
          className={`absolute bottom-4 left-4 right-4 transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full btn-primary bg-cream/90 hover:bg-cream text-charcoal border-transparent backdrop-blur-sm"
          >
            Agregar al carrito
          </button>
        </div>
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