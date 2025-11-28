import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';

import Header from '../components/Header';
import Hero from '../components/Hero';
import HandcraftedSection from '../components/HandcraftedSection';
import ProductGrid from '../components/ProductGrid';
import PhilosophySection from '../components/PhilosophySection';
import FeaturedSection from '../components/FeaturedSection';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import ProductModal from '../components/ProductModal';
import RevealOnScroll from '../components/RevealOnScroll';

export default function Home() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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

    return (
        <>
            {/* Header */}
            <Header
                cart={cart}
                onCartClick={() => setIsCartOpen(true)}
            />

            {/* Main Content */}
            <main className="animate-fade-in">
                <Hero startAnimations={true} />

                <RevealOnScroll>
                    <HandcraftedSection />
                </RevealOnScroll>

                <ProductGrid
                    onAddToCart={handleAddToCart}
                    onProductClick={handleProductClick}
                    limit={8}
                />

                <RevealOnScroll animation="animate-slide-up">
                    <PhilosophySection />
                </RevealOnScroll>

                <RevealOnScroll>
                    <FeaturedSection
                        onAddToCart={handleAddToCart}
                        onProductClick={handleProductClick}
                    />
                </RevealOnScroll>
            </main>

            {/* Footer */}
            <Footer />

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
        </>
    );
}
