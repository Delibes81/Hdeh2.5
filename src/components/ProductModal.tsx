'use client';
import { X, ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { sendGAEvent } from '@next/third-parties/google';
import { Product } from '../types';

import { formatPrice } from '../utils/format';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart
}: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedSize(null);
      setError(null);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Por favor selecciona una talla');
      return;
    }

    onAddToCart(product, selectedSize, quantity);

    sendGAEvent('event', 'add_to_cart', {
      currency: 'MXN',
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity,
          item_size: selectedSize
        }
      ]
    });

    // Show a brief confirmation
    const originalText = document.getElementById('add-to-cart-btn')?.textContent;
    const button = document.getElementById('add-to-cart-btn');
    if (button) {
      button.textContent = 'Agregado ✓';
      setTimeout(() => {
        if (button) button.textContent = originalText || 'Agregar al carrito';
      }, 1500);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      setError('Por favor selecciona una talla');
      return;
    }
    const isMTO = product?.isMadeToOrder || (product?.variants?.find(v => v.size === selectedSize)?.stock === 0);
    const messageText = isMTO ? ' (sobre pedido)' : '';
    const message = `Hola, me interesa encargar el producto${messageText}: ${product.name} en talla ${selectedSize.replace(' MX', '')}.`;
    const whatsappUrl = `https://wa.me/5215510821369?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Standard sizes for Made to Order if no variants exist
  const defaultMadeToOrderSizes = ['3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5'].map(size => ({
    id: `mto-${size}`,
    size: `${size} MX`,
    stock: 999
  }));

  const sortedVariants = product.isMadeToOrder && (!product.variants || product.variants.length === 0)
    ? defaultMadeToOrderSizes
    : product.variants?.slice().sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true })) || [];

  const isSelectedOutOfStock = !product?.isMadeToOrder && selectedSize && 
      (sortedVariants.find(v => v.size === selectedSize)?.stock === 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-cream shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
            {/* Image Gallery */}
            <div className="relative bg-white h-[40vh] lg:h-full lg:min-h-[600px] flex items-center justify-center">
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-contain p-8"
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream/80 hover:bg-cream transition-colors duration-300 rounded-full flex items-center justify-center"
                  >
                    <ChevronLeft size={20} className="text-charcoal" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream/80 hover:bg-cream transition-colors duration-300 rounded-full flex items-center justify-center"
                  >
                    <ChevronRight size={20} className="text-charcoal" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === currentImageIndex ? 'bg-charcoal' : 'bg-cream/60'
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-cream/80 hover:bg-cream transition-colors duration-300 rounded-full flex items-center justify-center z-10 shadow-sm"
              >
                <X size={20} className="text-charcoal" />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-6 lg:p-10 overflow-y-auto h-[50vh] lg:h-auto lg:max-h-[90vh]">
              <div className="space-y-6">
                {/* Badges */}
                <div className="flex items-center space-x-3">

                  {product.isFeatured && (
                    <span className="bg-soft-pink text-charcoal px-3 py-1 text-xs font-medium tracking-wide">
                      Destacado
                    </span>
                  )}
                </div>

                {/* Product Name & Price */}
                <div>
                  <h1 className="font-montserrat uppercase text-lg lg:text-xl text-charcoal mb-2">
                    {product.name}
                  </h1>
                  <p className="font-sans uppercase text-base lg:text-lg text-warm-gray font-light">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Description */}
                <p className="text-warm-gray text-base font-light leading-relaxed">
                  {product.description}
                </p>

                {/* Size Selector */}
                <div>
                  <h3 className="font-serif text-lg text-charcoal mb-3 flex flex-col">
                    Talla (MX)
                  </h3>
                  {product.isMadeToOrder && (
                    <div className="bg-stone-50 p-4 rounded-lg mb-4 text-sm text-charcoal border border-stone-200 shadow-sm animate-fade-in font-sans">
                      <p><strong>Producto sobre pedido:</strong> Este modelo se fabricará especialmente para ti. El tiempo estimado de fabricación es de aproximadamente <strong>3 semanas</strong>.</p>
                    </div>
                  )}
                  {!product.isMadeToOrder && isSelectedOutOfStock && (
                      <div className="bg-stone-50 p-4 rounded-lg mb-4 text-sm text-charcoal border border-stone-200 shadow-sm animate-fade-in font-sans">
                          <p><strong>Talla bajo pedido:</strong> Esta talla está agotada pero podemos fabricarla especialmente para ti. El tiempo aproximado de fabricación es de <strong>3 semanas</strong>.</p>
                      </div>
                  )}
                  {sortedVariants.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {sortedVariants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedSize(variant.size);
                            setError(null);
                          }}
                          className={`min-w-[3rem] h-10 px-3 border transition-colors duration-300 flex items-center justify-center text-sm font-medium
                            ${selectedSize === variant.size
                              ? 'bg-charcoal text-cream border-charcoal'
                              : 'bg-transparent text-charcoal border-warm-gray/30 hover:border-charcoal'
                            }
                            ${!product.isMadeToOrder && variant.stock === 0 ? 'relative overflow-hidden' : ''}
                          `}
                        >
                          {variant.size.replace(' MX', '')}
                          {!product.isMadeToOrder && variant.stock === 0 && (
                              <span className="absolute inset-0 bg-stone-100/50 flex items-center justify-center border-t border-b border-transparent pointer-events-none">
                                  <div className="w-full h-px bg-stone-300 rotate-45 absolute"></div>
                              </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-warm-gray italic">No hay tallas disponibles</p>
                  )}
                  {error && <p className="text-red-800 text-sm mt-2">{error}</p>}
                </div>

                {/* Quantity Selector */}
                <div>
                    <h3 className="font-serif text-lg text-charcoal mb-3">
                      Cantidad
                    </h3>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-warm-gray/30 text-warm-gray hover:text-charcoal hover:border-charcoal transition-colors duration-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium text-charcoal">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 border border-warm-gray/30 text-warm-gray hover:text-charcoal hover:border-charcoal transition-colors duration-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  <button
                    id="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className={`w-full btn-primary bg-charcoal text-cream border-transparent
                      ${!selectedSize ? 'opacity-70 cursor-not-allowed hover:bg-charcoal' : 'hover:bg-warm-gray'}
                    `}
                  >
                    {selectedSize ? 'Agregar al carrito' : 'Selecciona una talla'}
                  </button>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`flex-1 flex items-center justify-center py-3 rounded-full border border-warm-gray/30 hover:border-charcoal transition-colors font-medium text-sm
                        ${isLiked ? 'text-charcoal bg-stone/5' : 'text-warm-gray bg-transparent'}`}
                    >
                      <Heart
                        size={16}
                        className={`mr-2 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`}
                      />
                      {isLiked ? 'En favoritos' : 'Favorito'}
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center py-3 rounded-full border border-warm-gray/30 hover:border-charcoal text-warm-gray hover:text-charcoal transition-colors font-medium text-sm bg-transparent"
                    >
                      <Share2 size={16} className="mr-2" />
                      Compartir
                    </button>
                  </div>
                </div>

                {/* Materials & Disclaimer */}
                <div className="pt-6 border-t border-stone/20 space-y-3 text-sm text-warm-gray pb-4">
                  {product.materials && (
                    <p>Materiales: {product.materials.join(', ')}</p>
                  )}
                  <p>• Envío gratuito en México</p>
                  <p>• Cambios de talla gratuitos durante 30 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}