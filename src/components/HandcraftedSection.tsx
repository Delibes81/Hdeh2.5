import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function HandcraftedSection() {
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const images = [
    {
      src: '/images/1-2.webp',
      alt: 'Diseño atemporal',
      text: 'Diseño atemporal',
    },
    {
      src: '/images/2-2.webp',
      alt: 'El arte detrás de cada par',
      text: 'El arte detrás de cada par',
    },
    {
      src: '/images/3-2.webp',
      alt: 'Materiales de la más alta calidad',
      text: 'Materiales de la más alta calidad',
    }
  ];

  return (
    <section id="process" className="bg-white overflow-hidden w-full pt-4 md:pt-1">
      <div ref={elementRef} className="w-full flex justify-center">
        
        {/* Galería de Imágenes Completas */}
        <div className="w-full relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 md:gap-1 items-stretch justify-center h-[70vh] md:h-[85vh]">
            
            {/* Imagen Izquierda */}
            <div className={`relative w-full md:w-1/3 group overflow-hidden transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500 z-10" />
              <img 
                src={images[0].src} 
                alt={images[0].alt} 
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 px-6">
                <span className="text-white text-[10px] md:text-sm uppercase tracking-[0.25em] font-medium opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:-translate-y-1">
                  {images[0].text}
                </span>
              </div>
            </div>

            {/* Imagen Central */}
            <div className={`relative w-full md:w-1/3 group overflow-hidden transition-all duration-700 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500 z-10" />
              <img 
                src={images[1].src} 
                alt={images[1].alt} 
                className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 px-6 text-center">
                <span className="text-white text-[10px] md:text-sm uppercase tracking-[0.25em] font-medium opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:-translate-y-1">
                  {images[1].text}
                </span>
              </div>
            </div>

            {/* Imagen Derecha */}
            <div className={`relative w-full md:w-1/3 group overflow-hidden transition-all duration-700 delay-200 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500 z-10" />
              <img 
                src={images[2].src} 
                alt={images[2].alt} 
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 px-6 text-center">
                <span className="text-white text-[10px] md:text-sm uppercase tracking-[0.25em] font-medium opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:-translate-y-1">
                  {images[2].text}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}