import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';

interface FeaturedSectionProps {
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export default function FeaturedSection({ onAddToCart, onProductClick }: FeaturedSectionProps) {
  const { products, loading } = useProducts();

  if (loading) return null; // Don't show section while loading or show skeleton

  const featuredProduct = products.find(p => p.isFeatured) || products[0];

  if (!featuredProduct) return null;

  return (
    <section className="relative min-h-screen flex items-center bg-stone">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={featuredProduct.images[0]}
          alt={featuredProduct.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-charcoal/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-2xl animate-fade-in-up">
          {/* Badge */}
          <div className="mb-8">
            <span className="bg-cream/10 text-cream px-4 py-2 text-sm font-medium tracking-widest uppercase backdrop-blur-sm border border-cream/20">
              Pieza destacada
            </span>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <h2 className="font-serif font-light text-5xl lg:text-7xl text-cream leading-tight">
              El arte de lo
              <br />
              <em className="text-4xl lg:text-6xl">cotidiano</em>
            </h2>

            <p className="text-cream/90 text-lg lg:text-xl font-light leading-relaxed max-w-lg">
              {featuredProduct.description}
            </p>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl lg:text-3xl text-cream">
                {featuredProduct.name}
              </h3>

              <div className="flex items-center space-x-8">
                <span className="text-cream/80 text-xl font-light">
                  ${featuredProduct.price}
                </span>

                {featuredProduct.isHandcrafted && (
                  <span className="text-cream/70 text-sm tracking-wide uppercase">
                    Hecho a mano
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => onProductClick(featuredProduct)}
                className="btn-primary bg-transparent border-cream text-cream hover:bg-cream hover:text-charcoal"
              >
                Ver detalles
              </button>

              <button
                onClick={() => onAddToCart(featuredProduct)}
                className="btn-secondary text-cream hover:text-cream/70 border-b border-cream/30 hover:border-cream/70"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 right-8 text-cream/30">
        <div className="w-16 h-px bg-cream/30 mb-2"></div>
        <p className="text-xs tracking-widest uppercase">
          Crafted with love
        </p>
      </div>
    </section>
  );
}