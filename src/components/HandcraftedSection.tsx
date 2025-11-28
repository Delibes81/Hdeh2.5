import { Heart, Gem, Clock } from 'lucide-react';

export default function HandcraftedSection() {
  const features = [
    {
      icon: Heart,
      title: 'Hecho a mano',
      description: 'Cada pieza es creada con dedicación y técnicas artesanales tradicionales que han pasado de generación en generación.'
    },
    {
      icon: Gem,
      title: 'Materiales nobles',
      description: 'Seleccionamos cuidadosamente materiales de la más alta calidad, priorizando la sostenibilidad y la durabilidad.'
    },
    {
      icon: Clock,
      title: 'Diseño atemporal',
      description: 'Creamos piezas que trascienden las tendencias, diseñadas para acompañarte durante años con elegancia.'
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-beige">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-full border border-warm-gray/30">
                <feature.icon
                  size={28}
                  strokeWidth={1}
                  className="text-warm-gray"
                />
              </div>

              <h3 className="font-serif font-light text-2xl lg:text-3xl text-charcoal mb-4">
                {feature.title}
              </h3>

              <p className="text-warm-gray text-base lg:text-lg font-light leading-relaxed max-w-sm mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}