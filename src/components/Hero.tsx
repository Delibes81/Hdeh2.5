import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

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
        <div className="hidden md:block w-full h-full relative">
          <Image
            src="/images/Herohdeh.webp"
            alt="Artesanía elegante"
            fill
            priority
            sizes="100vw"
            className="object-cover object-left"
          />
        </div>
        <div className="md:hidden w-full h-full relative">
          <Image
            src="/images/hdehmobilehero.webp"
            alt="Artesanía elegante"
            fill
            priority
            sizes="100vw"
            className="object-cover object-left"
          />
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className={`font-serif uppercase font-light text-2xl md:text-4xl lg:text-6xl text-cream mb-24 text-shadow leading-[0.9] md:leading-[0.9] ${animationClass('animate-fade-in')}`}>
          Tu historia empieza
          <br />
          <span className="text-2xl md:text-4xl lg:text-5xl">con un solo paso.</span>
        </h1>

        <button
          onClick={scrollToCollection}
          className={`btn-primary bg-cream/10 hover:bg-cream hover:text-charcoal border-cream text-cream backdrop-blur-sm ${animationClass('animate-scale-in')}`}
        >
          Encuentra tu par
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
