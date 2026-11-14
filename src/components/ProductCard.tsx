'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types';
import { createSlug } from '../utils/format';
import PriceTag from './PriceTag';
import { usePromotion } from '../context/PromotionContext';

interface ProductCardProps {
  product: Product;
  index?: number;
  startAnimation?: boolean;
}

export default function ProductCard({ product, index = 0, startAnimation = true }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { promotion } = usePromotion();

  const handleImageChange = () => {
    if (product.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  return (
    <Link 
      href={`/shop/${createSlug(product.name)}`}
      className={`group cursor-pointer opacity-0 fill-mode-forwards block ${startAnimation ? 'animate-fade-in-up' : ''}`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-white flex flex-col justify-end"
        onMouseEnter={handleImageChange}
      >
        <Image
          src={product.images[imageIndex]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
        />



        {promotion && (
          <span className="absolute top-2 left-2 z-10 bg-charcoal text-cream text-[10px] lg:text-xs font-montserrat font-semibold tracking-wider px-2 py-1">
            -{promotion.discountPercent}%
          </span>
        )}

        {/* Add to Cart Button - appears on hover */}

      </div>

      {/* Product Info */}
      <div className="flex flex-col items-center px-1">
        <div className="text-left">
          <h3 className="font-montserrat uppercase text-sm lg:text-base tracking-wide text-charcoal group-hover:text-warm-gray transition-colors duration-300">
            {product.name}
          </h3>
          <p className="font-sans uppercase text-warm-gray font-light text-xs lg:text-[13px] mt-1">
            <PriceTag price={product.price} />
          </p>
        </div>
      </div>
    </Link>
  );
}