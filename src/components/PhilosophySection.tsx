import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function PhilosophySection() {
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '200px'
  });

  return (
    <section id="philosophy" className="py-24 lg:py-32 bg-pale-pink overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div ref={elementRef} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <div className={`space-y-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            <h2 className="font-serif font-light text-4xl lg:text-5xl text-charcoal leading-tight">
              Un poquito
              <br />
              sobre nosotros
            </h2>

            <div className="space-y-6 text-warm-gray text-lg font-light leading-relaxed">
              <p>
                H de Helena nació con el sueño de reinventar el calzado mexicano, siendo una firma que celebra la autenticidad a través de piezas creadas a mano, utilizando pieles de la más alta calidad y una visión estética que fusiona color, textura y diseño atemporal. Cada par es el resultado de manos expertas y de un enfoque particular a ser unicos, pensados para acompañar historias personales, recorridos significativos y momentos que se convierten en memoria.
              </p>

              <p>
                Nuestros zapatos nunca pasan desapercibidos, te impulsan a vivir la autenticidad de cada momento.
              </p>

              <p>
                Me encanta pensar que detrás de cada par que alguien compra está la creatividad, entrega y trabajo de un equipo de personas apasionadas por lo que hacemos, desde los bocetos, cada costura, cada herraje grabado y cada empaque.
              </p>
            </div>

            <div className="pt-4">
              <div className="w-16 h-px bg-warm-gray/30 mb-4"></div>
              <p className="text-sm text-warm-gray font-medium tracking-wide uppercase">
                Helena Navarrete, Fundadora
              </p>
            </div>
          </div>

          {/* Image */}
          <div className={`relative h-[600px] group transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
            <img
              src="/images/philosophy-workshop.jpg"
              alt="Artesano trabajando"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute -bottom-12 -left-12 bg-white p-8 max-w-xs shadow-xl hidden md:block transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="font-serif text-xl italic text-charcoal mb-4">
                "La verdadera elegancia está en los detalles que nadie ve, pero que todos sienten."
              </p>
              <p className="text-sm text-warm-gray uppercase tracking-widest">
                Helena Navarrete
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}