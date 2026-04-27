import { X, ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    const message = `Hola, me interesa encargar el producto de edición especial: ${product.name} en talla ${selectedSize.replace(' MX', '')}.`;
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
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain p-8"
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
                    {product.isMadeToOrder && (
                      <span className="text-xs font-sans text-warm-gray mt-1 normal-case tracking-normal">
                        Producto de edición por encargo. Elige tu talla y mándanos un mensaje.
                      </span>
                    )}
                  </h3>
                  {sortedVariants.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {sortedVariants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedSize(variant.size);
                            setError(null);
                          }}
                          disabled={!product.isMadeToOrder && variant.stock === 0}
                          className={`min-w-[3rem] h-10 px-3 border transition-colors duration-300 flex items-center justify-center text-sm font-medium
                            ${selectedSize === variant.size
                              ? 'bg-charcoal text-cream border-charcoal'
                              : 'bg-transparent text-charcoal border-warm-gray/30 hover:border-charcoal'
                            }
                            ${!product.isMadeToOrder && variant.stock === 0 ? 'opacity-40 cursor-not-allowed bg-stone/20' : ''}
                          `}
                        >
                          {variant.size.replace(' MX', '')}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-warm-gray italic">No hay tallas disponibles</p>
                  )}
                  {error && <p className="text-red-800 text-sm mt-2">{error}</p>}
                </div>

                {/* Quantity Selector */}
                {!product.isMadeToOrder && (
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
                )}

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  {product.isMadeToOrder ? (
                    <button
                      onClick={handleWhatsAppOrder}
                      disabled={!selectedSize}
                      className={`w-full btn-primary bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent flex items-center justify-center gap-2
                        ${!selectedSize ? 'opacity-70 cursor-not-allowed' : ''}
                      `}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {selectedSize ? 'Pedir por WhatsApp' : 'Selecciona una talla'}
                    </button>
                  ) : (
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
                  )}

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