import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function PhilosophySection() {
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '200px'
  });

  return (
    <section id="philosophy" className="py-12 lg:py-16 bg-pale-pink overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div ref={elementRef} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <div className={`space-y-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            <h2 className="font-serif uppercase font-light text-3xl md:text-3xl lg:text-3xl text-charcoal leading-tight">
              Un poquito
              <br />
              sobre nosotros
            </h2>

            <div className="space-y-6 text-warm-gray text-lg font-sans lowercase font-light leading-relaxed">
              <p>
                <span className="uppercase">H</span> de Helena nació con el sueño de reinventar el calzado mexicano, siendo una firma que celebra la autenticidad a través de piezas creadas a mano, utilizando pieles de la más alta calidad y una visión estética que fusiona color, textura y diseño atemporal. Cada par es el resultado de manos expertas y de un enfoque particular a ser unicos, pensados para acompañar historias personales, recorridos significativos y momentos que se convierten en memoria.
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
              <p className="text-sm font-montserrat text-warm-gray font-medium tracking-wide uppercase">
                Helena
              </p>
            </div>
          </div>

          {/* Image */}
          <div className={`relative h-[500px] lg:h-[600px] group transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
            <img
              src="/images/artesano.webp"
              alt="Artesano trabajando"
              className="w-full h-full object-cover rounded-xl shadow-lg transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}