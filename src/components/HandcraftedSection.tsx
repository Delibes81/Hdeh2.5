import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function HandcraftedSection() {
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const images = [
    {
      src: '/images/1-2.webp',
      alt: 'Diseño atemporal',
      text: 'Diseño atemporal',
      description: [
        'NUESTROS PARES NO SIGUEN TENDENCIAS, TRASCIENDEN.',
        'DISEÑAMOS DESDE LO ESENCIAL: SILUETAS ATEMPORALES QUE REINTERPRETAMOS CON EL TIEMPO.',
        'CREEMOS EN LO QUE PERMANECE, EN ZAPATOS PENSADOS PARA ACOMPAÑARTE SIEMPRE.',
        'LO BÁSICO PARA NOSOTROS ES UN STATEMENT.'
      ]
    },
    {
      src: '/images/2-2.webp',
      alt: 'El arte detrás de cada par',
      text: 'El arte detrás de cada par',
      description: [
        'CADA PAR SE HACE A MANO, PASO A PASO.',
        'MANOS EXPERTAS QUE CORTAN, COSEN Y DAN FORMA CON PRECISIÓN.',
        'NO HAY DOS IGUALES.',
        'CADA PIEZA GUARDA EL TIEMPO Y EL OFICIO DE NUESTROS ARTESANOS.',
        'HONRAMOS EL TRABAJO BIEN HECHO Y LA TRADICIÓN QUE PERDURA EN MÉXICO.'
      ]
    },
    {
      src: '/images/3-2.webp',
      alt: 'Materiales de la más alta calidad',
      text: 'Materiales de la más alta calidad',
      description: [
        'CADA PAR ESTÁ HECHO CON PIELES DE LA MÁS ALTA CALIDAD.',
        'ELEGIMOS MATERIALES NATURALES POR LO QUE SON Y POR LO QUE PUEDEN VOLVER A SER.',
        'CREEMOS EN SU PERMANENCIA, EN SU CAPACIDAD DE TRANSFORMARSE.',
        'DARLES UNA SEGUNDA VIDA TAMBIÉN ES PARTE DEL DISEÑO.'
      ]
    }
  ];

  return (
    <section id="process" className="bg-white overflow-hidden w-full pt-4 md:pt-1">
      <div ref={elementRef} className="w-full flex justify-center">

        {/* Galería de Imágenes Completas */}
        <div className="w-full relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 md:gap-1 items-stretch justify-center h-[70vh] md:h-[85vh]">

            {images.map((item, index) => {
              const delay = index === 0 ? 'delay-100' : index === 1 ? 'delay-300' : 'delay-500';
              return (
                <div key={index} className={`relative w-full md:w-1/3 group overflow-hidden transition-all duration-[1.5s] ${delay} ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  {/* Imagen de fondo */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/60 transition-colors duration-700 z-10" />
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110"
                  />
                  
                  {/* Degradado inferior para el título */}
                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
                  
                  {/* Título en la parte inferior (desaparece al hacer hover) */}
                  <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 px-6 text-center transition-opacity duration-500 group-hover:opacity-0">
                    <span className="font-montserrat text-white text-[10px] md:text-sm uppercase tracking-[0.25em] font-medium opacity-90">
                      {item.text}
                    </span>
                  </div>

                  {/* Texto descriptivo al hacer hover (aparece en el centro) */}
                  <div className="absolute inset-0 z-30 flex flex-col justify-center items-center px-8 text-center opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                    <div className="space-y-6">
                      {item.description.map((line, i) => (
                        <p key={i} className="font-sans text-[10px] md:text-xs text-white/90 uppercase tracking-widest leading-relaxed font-light">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </section>
  );
}