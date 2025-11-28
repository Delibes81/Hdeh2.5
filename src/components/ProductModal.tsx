import { X, ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product) => void;
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
    onAddToCart(product);
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-cream rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
            {/* Image Gallery */}
            <div className="relative bg-stone/10">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
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
                className="absolute top-4 right-4 w-10 h-10 bg-cream/80 hover:bg-cream transition-colors duration-300 rounded-full flex items-center justify-center"
              >
                <X size={20} className="text-charcoal" />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-8 lg:p-12 overflow-y-auto">
              <div className="space-y-6">
                {/* Badges */}
                <div className="flex items-center space-x-3">
                  {product.isHandcrafted && (
                    <span className="bg-stone text-charcoal px-3 py-1 text-xs font-medium tracking-wide">
                      Artesanal
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-soft-pink text-charcoal px-3 py-1 text-xs font-medium tracking-wide">
                      Destacado
                    </span>
                  )}
                </div>

                {/* Product Name & Price */}
                <div>
                  <h1 className="font-serif font-light text-3xl lg:text-4xl text-charcoal mb-2">
                    {product.name}
                  </h1>
                  <p className="text-2xl text-warm-gray font-light">
                    ${product.price}
                  </p>
                </div>

                {/* Description */}
                <p className="text-warm-gray text-lg font-light leading-relaxed">
                  {product.description}
                </p>

                {/* Materials */}
                {product.materials && product.materials.length > 0 && (
                  <div>
                    <h3 className="font-serif text-lg text-charcoal mb-3">
                      Materiales
                    </h3>
                    <ul className="space-y-1">
                      {product.materials.map((material, index) => (
                        <li key={index} className="text-warm-gray font-light">
                          • {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dimensions */}
                {product.dimensions && (
                  <div>
                    <h3 className="font-serif text-lg text-charcoal mb-2">
                      Dimensiones
                    </h3>
                    <p className="text-warm-gray font-light">
                      {product.dimensions}
                    </p>
                  </div>
                )}

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
                    className="w-full btn-primary bg-charcoal text-cream hover:bg-warm-gray border-transparent"
                  >
                    Agregar al carrito
                  </button>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`flex-1 btn-secondary border border-warm-gray/30 hover:border-charcoal ${isLiked ? 'text-charcoal' : 'text-warm-gray'
                        }`}
                    >
                      <Heart
                        size={16}
                        className={`mr-2 ${isLiked ? 'fill-current' : ''}`}
                      />
                      {isLiked ? 'En favoritos' : 'Favorito'}
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex-1 btn-secondary border border-warm-gray/30 hover:border-charcoal text-warm-gray hover:text-charcoal"
                    >
                      <Share2 size={16} className="mr-2" />
                      Compartir
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-6 border-t border-stone/20 space-y-3 text-sm text-warm-gray">
                  <p>• Envío gratuito en pedidos superiores a $3000</p>
                  <p>• Devoluciones gratuitas durante 30 días</p>
                  <p>• Cada pieza es única debido a su naturaleza artesanal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}