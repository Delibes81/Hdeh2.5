export default function PhilosophySection() {
  return (
    <section id="philosophy" className="py-24 lg:py-32 bg-pale-pink">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-slide-up">
            <h2 className="font-serif font-light text-4xl lg:text-5xl text-charcoal leading-tight">
              Nuestra
              <br />
              Filosofía
            </h2>

            <div className="space-y-6 text-warm-gray text-lg font-light leading-relaxed">
              <p>
                En H de Helena creemos que el verdadero lujo reside en la
                <em className="font-serif text-charcoal"> autenticidad y la artesanía</em>.
                Cada pieza que creamos es una celebración de las técnicas
                tradicionales y la belleza de lo hecho a mano.
              </p>

              <p>
                Nuestro compromiso va más allá de crear objetos hermosos;
                buscamos preservar un legado de maestría artesanal mientras
                diseñamos piezas que se integren naturalmente en la vida moderna.
              </p>

              <p>
                Creemos en el <em className="font-serif text-charcoal">lujo accesible</em>,
                en piezas que cuentan historias y que están hechas para durar,
                trascendiendo las tendencias pasajeras para convertirse en
                compañeros atemporales de tu estilo personal.
              </p>
            </div>

            <div className="pt-4">
              <div className="w-16 h-px bg-warm-gray/30 mb-4"></div>
              <p className="text-sm text-warm-gray font-medium tracking-wide uppercase">
                Helena Martín, Fundadora
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[600px] group animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <img
              src="/images/philosophy.png"
              alt="Artesano trabajando"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute -bottom-12 -left-12 bg-white p-8 max-w-xs shadow-xl hidden md:block animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <p className="font-serif text-xl italic text-charcoal mb-4">
                "La verdadera elegancia está en los detalles que nadie ve, pero que todos sienten."
              </p>
              <p className="text-sm text-warm-gray uppercase tracking-widest">
                Helena de la Fuente
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}