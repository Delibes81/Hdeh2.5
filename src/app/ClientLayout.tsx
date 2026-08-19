'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '../hooks/useCart';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import FloatingControls from '../components/FloatingControls';
import Preloader from '../components/Preloader';
import ScrollToTop from '../components/ScrollToTop';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

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

      </div>
    </>
  );
}
