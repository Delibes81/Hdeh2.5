import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Product } from './types';
import { useCart } from './hooks/useCart';

import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import ProductModal from './components/ProductModal';
import FloatingControls from './components/FloatingControls';
import Preloader from './components/Preloader';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Shop from './pages/Shop';

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const location = useLocation();

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  // Show header/footer on all pages except homepage (which has its own header)
  const isHomePage = location.pathname === '/';

  return (
    <>
      <ScrollToTop />

      <div className="min-h-screen">
        <FloatingControls />

        {!isHomePage && (
          <Header
            cart={cart}
            onCartClick={() => setIsCartOpen(true)}
          />
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/shop"
            element={
              <Shop
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            }
          />
        </Routes>

        {!isHomePage && <Footer />}

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

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Check if this is the first load
    const hasLoadedBefore = sessionStorage.getItem('hasLoaded');

    if (hasLoadedBefore) {
      setIsInitialLoad(false);
    } else {
      sessionStorage.setItem('hasLoaded', 'true');
    }
  }, []);

  return (
    <BrowserRouter>
      {isInitialLoad && <Preloader onFinish={() => setIsInitialLoad(false)} />}
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
