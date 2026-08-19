'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import ProductModal from '../components/ProductModal';
import FloatingControls from '../components/FloatingControls';
import Preloader from '../components/Preloader';
import ScrollToTop from '../components/ScrollToTop';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('hasLoaded')) {
        setIsInitialLoad(false);
      } else {
        sessionStorage.setItem('hasLoaded', 'true');
      }
    }
  }, []);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  const handleAddToCart = (product: Product, size: string, quantity = 1) => {
    addToCart(product, size, quantity);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  // Show header/footer on all pages except homepage (which has its own header) and admin pages
  const isHomePage = pathname === '/';
  const isAdminPage = pathname?.startsWith('/admin');
  const showGlobalHeader = !isHomePage && !isAdminPage;

  return (
    <>
      <ScrollToTop />
      {isInitialLoad && <Preloader onFinish={() => setIsInitialLoad(false)} />}
      
      <div className="min-h-screen">
        {!isAdminPage && <FloatingControls />}

        {showGlobalHeader && (
          <Header
            cart={cart}
            onCartClick={() => setIsCartOpen(true)}
          />
        )}

        {/* Las páginas se inyectan aquí */}
        {children}

        {showGlobalHeader && <Footer />}

        {/* Modals */}
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
        />

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={handleCloseProductModal}
          product={selectedProduct}
          onAddToCart={handleAddToCart}
        />
      </div>
    </>
  );
}
