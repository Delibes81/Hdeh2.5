'use client';
import { X, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { Cart } from '../types';
import { supabase } from '../lib/supabase';
import { useEffect, useRef, useState } from 'react';

import { formatPrice } from '../utils/format';
import { getProductionQuantity } from '../utils/inventory';
import { getErrorMessage } from '../utils/errors';
import { Coupon } from '../types';
import { savePendingMetaPurchase, trackMetaEvent } from '../lib/metaPixel';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
}

export default function CartModal({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart }: CartModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /* Checkout Logic */
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  /* Coupon Logic */
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
        const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCode }),
        });
        const result = await response.json() as {
            valid?: boolean;
            error?: string;
            coupon?: {
                code: string;
                discountType: 'percentage' | 'fixed';
                discountValue: number;
            };
        };

        if (!response.ok || !result.valid || !result.coupon) {
            setCouponError(result.error || 'Cupón inválido o inactivo');
            setAppliedCoupon(null);
            return;
        }

        const mappedCoupon: Coupon = {
            id: result.coupon.code,
            code: result.coupon.code,
            discountType: result.coupon.discountType,
            discountValue: result.coupon.discountValue,
            isActive: true,
            usedCount: 0,
        };

        setAppliedCoupon(mappedCoupon);
        setCouponError(null);
    } catch {
        setCouponError('Error al validar cupón');
        setAppliedCoupon(null);
    } finally {
        setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError(null);
  };

  const calculateDiscount = () => {
      if (!appliedCoupon) return 0;
      if (appliedCoupon.discountType === 'percentage') {
          return cart.total * (appliedCoupon.discountValue / 100);
      }
      return Math.min(appliedCoupon.discountValue, cart.total); // Max discount is total
  };

  const discountAmount = calculateDiscount();
  const finalTotal = Math.max(0, cart.total - discountAmount);

  const handleCheckout = async () => {
    const metaCheckout = {
      content_ids: cart.items.map(item => item.product.id),
      content_type: 'product' as const,
      contents: cart.items.map(item => ({
        id: item.product.id,
        quantity: item.quantity,
        item_price: item.product.price,
      })),
      currency: 'MXN' as const,
      num_items: cart.itemCount,
      value: finalTotal,
    };

    trackMetaEvent('InitiateCheckout', metaCheckout);
    setIsCheckingOut(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || window.location.origin;

      // 1. Call Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: cart.items.map(item => ({
            productId: item.product.id,
            size: item.size,
            quantity: item.quantity
          })),
          couponCode: appliedCoupon?.code,
          success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/shop`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // 2. Redirect to Stripe
      if (data?.url) {
        savePendingMetaPurchase(metaCheckout);
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      console.error('Checkout Error:', error);
      alert(`Error al iniciar pago: ${getErrorMessage(error, 'Error desconocido')}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone/10 flex justify-between items-center bg-stone/5">
          <h2 id="cart-title" className="font-serif text-2xl text-charcoal flex items-center gap-2">
            <ShoppingBag size={24} />
            Tu Carrito
            <span className="text-sm font-sans font-normal text-warm-gray ml-2">({cart.itemCount} items)</span>
          </h2>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Cerrar carrito" className="text-warm-gray hover:text-charcoal transition-colors">
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
                    {getProductionQuantity(item.product, item.size, item.quantity) > 0 && (
                      <p className="text-xs font-medium text-amber-800 mt-1">
                        {getProductionQuantity(item.product, item.size, item.quantity)} {getProductionQuantity(item.product, item.size, item.quantity) === 1 ? 'unidad requiere' : 'unidades requieren'} fabricación
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 bg-stone/5 rounded-full px-3 py-1">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity - 1)}
                        aria-label={`Disminuir cantidad de ${item.product.name}`}
                        className="text-warm-gray hover:text-charcoal disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity + 1)}
                        aria-label={`Aumentar cantidad de ${item.product.name}`}
                        className="text-warm-gray hover:text-charcoal"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <button onClick={() => onRemoveItem(item.product.id, item.size)} className="text-xs text-red-700 hover:text-red-800 mb-1 block ml-auto">
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
            
            {/* Coupon Section */}
            <div className="bg-white p-3 rounded-lg border border-stone-200">
                {!appliedCoupon ? (
                    <div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                data-testid="coupon-input"
                                aria-label="Código de descuento"
                                placeholder="Código de descuento"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded outline-none focus:border-charcoal uppercase"
                            />
                            <button
                                onClick={applyCoupon}
                                data-testid="apply-coupon"
                                disabled={isApplyingCoupon || !couponCode.trim()}
                                className="px-4 py-2 bg-charcoal text-white text-xs uppercase tracking-wider rounded font-medium disabled:opacity-50"
                            >
                                {isApplyingCoupon ? '...' : 'Aplicar'}
                            </button>
                        </div>
                        {couponError && <p className="text-red-700 text-xs mt-2">{couponError}</p>}
                    </div>
                ) : (
                    <div className="flex justify-between items-center bg-stone-50 p-2 rounded border border-stone-200">
                        <div>
                            <p className="text-xs font-semibold text-charcoal uppercase flex items-center gap-1">
                                ✓ {appliedCoupon.code}
                            </p>
                            <p className="text-xs text-warm-gray">
                                {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% de descuento` : `${formatPrice(appliedCoupon.discountValue)} de descuento`}
                            </p>
                        </div>
                        <button onClick={removeCoupon} className="text-xs text-red-700 hover:text-red-800 underline">
                            Quitar
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-2 border-b border-stone/10 pb-4 mb-4">
                <div className="flex justify-between items-end">
                  <span className="text-warm-gray text-sm uppercase tracking-wider">Subtotal</span>
                  <span className="text-lg text-charcoal">{formatPrice(cart.total)}</span>
                </div>
                {appliedCoupon && (
                    <div className="flex justify-between items-end text-green-600">
                      <span className="text-sm uppercase tracking-wider">Descuento</span>
                      <span className="text-lg">- {formatPrice(discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between items-end pt-2">
                  <span className="text-charcoal font-medium text-sm uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-medium text-charcoal">{formatPrice(finalTotal)}</span>
                </div>
            </div>

            <button
              onClick={handleCheckout}
              data-testid="checkout"
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
