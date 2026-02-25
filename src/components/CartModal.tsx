import { X, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { Cart } from '../types';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

import { formatPrice } from '../utils/format';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
}

export default function CartModal({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart }: CartModalProps) {
  /* Checkout Logic */
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // 1. Call Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: cart.items.map(item => ({
            productId: item.product.id,
            size: item.size,
            quantity: item.quantity
          })),
          success_url: import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/success` : window.location.origin + '/success',
          cancel_url: import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/shop` : window.location.origin + '/shop',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // 2. Redirect to Stripe
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout Error:', error);
      alert(`Error al iniciar pago: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-stone/10 flex justify-between items-center bg-stone/5">
          <h2 className="font-serif text-2xl text-charcoal flex items-center gap-2">
            <ShoppingBag size={24} />
            Tu Carrito
            <span className="text-sm font-sans font-normal text-warm-gray ml-2">({cart.itemCount} items)</span>
          </h2>
          <button onClick={onClose} className="text-warm-gray hover:text-charcoal transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBag size={48} className="text-warm-gray/30" />
              <p className="text-warm-gray text-lg">Tu carrito está vacío</p>
              <button onClick={onClose} className="text-charcoal underline hover:text-warm-gray">
                Continuar comprando
              </button>
            </div>
          ) : (
            cart.items.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${index}`} className="flex gap-4 animate-fade-in">
                <div className="w-24 h-32 bg-stone/10 rounded-md overflow-hidden flex flex-shrink-0 items-center justify-center p-2">
                  <img src={item.product.images[0]} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-charcoal">{item.product.name}</h3>
                    <p className="text-sm text-warm-gray">{item.product.category}</p>
                    <p className="text-sm font-medium text-warm-gray mt-1">Talla: {item.size}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 bg-stone/5 rounded-full px-3 py-1">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="text-warm-gray hover:text-charcoal disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="text-warm-gray hover:text-charcoal"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <button onClick={() => onRemoveItem(item.product.id, item.size)} className="text-xs text-red-500 hover:text-red-700 mb-1 block ml-auto">
                        Eliminar
                      </button>
                      <p className="font-medium text-charcoal">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="p-6 border-t border-stone/10 bg-stone/5 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-warm-gray text-sm uppercase tracking-wider">Total</span>
              <span className="text-2xl font-medium text-charcoal">{formatPrice(cart.total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full btn-primary bg-charcoal text-cream hover:bg-warm-gray py-4 flex items-center justify-center gap-2"
            >
              {isCheckingOut ? 'Procesando...' : 'Proceder al Pago'}
              <ArrowRight size={18} />
            </button>

            <button onClick={onClearCart} className="w-full text-xs text-warm-gray hover:text-charcoal text-center mt-2">
              Vaciar Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}