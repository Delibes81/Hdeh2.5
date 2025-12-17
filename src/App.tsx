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
import Success from './pages/Success';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';

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
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');
  const showGlobalHeader = !isHomePage && !isAdminPage;

  return (
    <>
      <ScrollToTop />

      <div className="min-h-screen">
        {!isAdminPage && <FloatingControls />}

        {showGlobalHeader && (
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
                onAddToCart={(product) => handleProductClick(product)} // Redirect add to cart to detail view
                onProductClick={handleProductClick}
              />
            }
          />

          <Route path="/success" element={<Success />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Dashboard />} />
          </Route>
        </Routes>

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

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(() => {
    return !sessionStorage.getItem('hasLoaded');
  });

  useEffect(() => {
    if (!sessionStorage.getItem('hasLoaded')) {
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
