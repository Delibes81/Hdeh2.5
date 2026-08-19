'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { Cart, Product, CartItem } from '../types';

const CART_STORAGE_KEY = 'helena-cart';

interface CartContextType {
    cart: Cart;
    addToCart: (product: Product, size: string, quantity?: number) => void;
    removeFromCart: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, newQuantity: number) => void;
    clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart>(() => {
        try {
            if (typeof window !== 'undefined') {
                const savedCart = localStorage.getItem(CART_STORAGE_KEY);
                return savedCart ? JSON.parse(savedCart) : { items: [], total: 0, itemCount: 0 };
            }
            return { items: [], total: 0, itemCount: 0 };
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return { items: [], total: 0, itemCount: 0 };
        }
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, size: string, quantity = 1) => {
        setCart(prevCart => {
            // Find item with same ID AND same size
            const existingItem = prevCart.items.find(item =>
                item.product.id === product.id && item.size === size
            );

            // Find variant stock
            const variant = product.variants?.find(v => v.size === size);
            const maxStock = variant?.stock || 0;
            const isMTO = product.isMadeToOrder || maxStock === 0;

            let newItems: CartItem[];
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (!isMTO && newQuantity > maxStock) {
                    alert(`Lo sentimos, solo hay ${maxStock} unidades disponibles en esta talla.`);
                    return prevCart;
                }

                newItems = prevCart.items.map(item =>
                    item.product.id === product.id && item.size === size
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                if (!isMTO && quantity > maxStock) {
                    alert(`Lo sentimos, solo hay ${maxStock} unidades disponibles en esta talla.`);
                    return prevCart;
                }
                newItems = [...prevCart.items, { product, size, quantity }];
            }

            const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: newItems,
                total,
                itemCount
            };
        });
    };

    const removeFromCart = (productId: string, size: string) => {
        setCart(prevCart => {
            const newItems = prevCart.items.filter(item =>
                !(item.product.id === productId && item.size === size)
            );
            const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: newItems,
                total,
                itemCount
            };
        });
    };

    const updateQuantity = (productId: string, size: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId, size);
            return;
        }

        setCart(prevCart => {
            // Check stock before updating
            const itemToUpdate = prevCart.items.find(item =>
                item.product.id === productId && item.size === size
            );

            if (itemToUpdate) {
                const variant = itemToUpdate.product.variants?.find(v => v.size === size);
                const maxStock = variant?.stock || 0;
                const isMTO = itemToUpdate.product.isMadeToOrder || maxStock === 0;

                if (!isMTO && newQuantity > maxStock) {
                    alert(`Lo sentimos, solo hay ${maxStock} unidades disponibles en esta talla.`);
                    return prevCart;
                }
            }

            const newItems = prevCart.items.map(item =>
                item.product.id === productId && item.size === size
                    ? { ...item, quantity: newQuantity }
                    : item
            );

            const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: newItems,
                total,
                itemCount
            };
        });
    };

    const clearCart = () => {
        setCart({
            items: [],
            total: 0,
            itemCount: 0
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}
