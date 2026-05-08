'use client';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';

import Header from '../components/Header';
import Hero from '../components/Hero';
import HandcraftedSection from '../components/HandcraftedSection';
import ProductGrid from '../components/ProductGrid';
import PhilosophySection from '../components/PhilosophySection';
import FeaturedSection from '../components/FeaturedSection';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import RevealOnScroll from '../components/RevealOnScroll';
import SEO from '../components/SEO';

export default function Home() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart
    } = useCart();

    return (
        <>
            <SEO />
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
                    limit={4}
                />

                <RevealOnScroll animation="animate-slide-up">
                    <PhilosophySection />
                </RevealOnScroll>

                <RevealOnScroll>
                    <FeaturedSection />
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
        </>
    );
}
