import { ChevronDown } from 'lucide-react';

interface HeroProps {
  startAnimations?: boolean;
}

export default function Hero({ startAnimations = true }: HeroProps) {
  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const animationClass = (base: string) => startAnimations ? base : 'opacity-0';

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-new.jpg"
          alt="Artesanía elegante"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h2 className={`font-serif font-light text-4xl md:text-6xl lg:text-7xl text-cream mb-6 text-shadow ${animationClass('animate-fade-in')}`}>
          Lujo artesanal
          <br />
          <span className="text-3xl md:text-5xl lg:text-6xl">para tu día a día</span>
        </h2>

        <p className={`text-lg md:text-xl text-cream/90 mb-12 max-w-2xl mx-auto font-light text-shadow ${animationClass('animate-slide-up')}`}>
          Descubre piezas únicas creadas con pasión y técnicas tradicionales
        </p>

        <button
          onClick={scrollToCollection}
          className={`btn-primary bg-cream/10 hover:bg-cream hover:text-charcoal border-cream text-cream backdrop-blur-sm ${animationClass('animate-scale-in')}`}
        >
          Descubre la colección
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce ${startAnimations ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={scrollToCollection}
          className="text-cream/70 hover:text-cream transition-colors duration-300"
          aria-label="Scroll hacia abajo"
        >
          <ChevronDown size={24} strokeWidth={1} />
        </button>
      </div>
    </section>
  );
}