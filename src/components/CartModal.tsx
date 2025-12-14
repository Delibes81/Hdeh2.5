import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Cart } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartModalProps) {
  if (!isOpen) return null;

  const handleCheckout = () => {
    alert('Funcionalidad de checkout próximamente. Por ahora, contacta con nosotros para realizar tu pedido.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone/20">
            <h2 className="font-serif text-2xl text-charcoal">
              Tu Carrito
              {cart.itemCount > 0 && (
                <span className="text-warm-gray text-lg ml-2">
                  ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>

            <button
              onClick={onClose}
              className="p-2 text-warm-gray hover:text-charcoal transition-colors duration-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-warm-gray/30 mb-4" strokeWidth={1} />
                <p className="text-warm-gray text-lg font-light mb-2">
                  Tu carrito está vacío
                </p>
                <p className="text-warm-gray/60 text-sm">
                  Agrega algunos productos para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.items.map((item, index) => (
                  <div key={`${item.product.id}-${item.size}-${index}`} className="flex space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg text-charcoal mb-0.5">
                        {item.product.name}
                      </h3>

                      <p className="text-sm text-warm-gray mb-1">
                        Talla: <span className="font-medium text-charcoal">{item.size.replace(' MX', '')}</span>
                      </p>

                      <p className="text-warm-gray text-sm mb-3">
                        ${item.product.price} c/u
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-warm-gray/30 text-warm-gray hover:text-charcoal hover:border-charcoal transition-colors duration-300"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-8 text-center text-charcoal font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-warm-gray/30 text-warm-gray hover:text-charcoal hover:border-charcoal transition-colors duration-300"
                        >
                          <Plus size={14} />
                        </button>

                        <button
                          onClick={() => onRemoveItem(item.product.id, item.size)}
                          className="ml-auto text-warm-gray/60 hover:text-charcoal transition-colors duration-300 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-medium text-charcoal">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                {cart.items.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="text-warm-gray/60 hover:text-charcoal transition-colors duration-300 text-sm underline"
                  >
                    Vaciar carrito
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-stone/20 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg">
                <span className="font-serif text-charcoal">Total:</span>
                <span className="font-medium text-charcoal">
                  ${cart.total.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full btn-primary bg-charcoal text-cream hover:bg-warm-gray border-transparent"
              >
                Finalizar Compra
              </button>

              <p className="text-xs text-warm-gray/60 text-center">
                Envío gratuito en pedidos superiores a $3000
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}