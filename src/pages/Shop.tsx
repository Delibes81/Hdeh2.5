import { useState } from 'react';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { Search, Loader } from 'lucide-react';
import SEO from '../components/SEO';

interface ShopProps {
    onAddToCart: (product: Product) => void;
    onProductClick: (product: Product) => void;
}

export default function Shop({ onAddToCart, onProductClick }: ShopProps) {
    const { products, loading, error } = useProducts();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { key: 'all', label: 'Todos los Estilos', icon: ' ✨' },
        { key: 'zapatos-bajos', label: 'Zapatos bajos', icon: '🥿' },
        { key: 'zapatos-altos', label: 'Zapatos Altos', icon: '👠' },
        { key: 'botas', label: 'Botas', icon: '🥾' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-charcoal" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center text-red-500">
                Error al cargar productos: {error}
            </div>
        );
    }

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-cream">
            <SEO title="Tienda" description="Explora nuestra colección completa de zapatos de piel artesanales." url="/shop" />
            {/* Header Section */}
            <section className="relative py-24 lg:py-32 bg-gradient-to-br from-pale-pink via-cream to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <div className="inline-block mb-4 px-4 py-2 bg-charcoal/5 rounded-full">
                        <span className="text-sm font-medium text-charcoal tracking-widest uppercase">Nueva Temporada</span>
                    </div>
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-6">
                        El Paso Perfecto
                    </h1>
                    <p className="text-warm-gray text-lg lg:text-xl font-light max-w-2xl mx-auto">
                        Descubre la colección que define tu estilo único
                    </p>
                </div>
            </section>

            {/* Search and Filters */}
            <section className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-warm-gray/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-gray" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar tu próximo favorito..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-warm-gray/20 rounded-full focus:border-charcoal focus:outline-none transition-all duration-300 text-charcoal placeholder-warm-gray/60"
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.key}
                                onClick={() => setSelectedCategory(category.key)}
                                className={`group px-4 lg:px-6 py-2.5 rounded-full font-medium text-sm lg:text-base tracking-wide transition-all duration-300 ${selectedCategory === category.key
                                    ? 'bg-charcoal text-cream shadow-lg scale-105'
                                    : 'bg-white text-warm-gray hover:bg-charcoal/5 hover:text-charcoal border border-warm-gray/20'
                                    }`}
                            >
                                <span className="mr-2 text-base">{category.icon}</span>
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-warm-gray text-sm font-medium">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'pieza' : 'piezas'}
                        </p>
                        <div className="h-px flex-1 mx-6 bg-warm-gray/20"></div>
                        <p className="text-warm-gray text-xs uppercase tracking-widest">
                            {selectedCategory === 'all' ? 'Toda la colección' : categories.find(c => c.key === selectedCategory)?.label}
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                                onProductClick={onProductClick}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-24">
                            <div className="inline-block mb-6 text-6xl opacity-20">🔍</div>
                            <h3 className="font-serif text-2xl text-charcoal mb-3">
                                No encontramos lo que buscas
                            </h3>
                            <p className="text-warm-gray text-lg font-light mb-6">
                                Intenta con otros filtros o términos de búsqueda
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSearchQuery('');
                                }}
                                className="btn-primary"
                            >
                                Ver toda la colección
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
