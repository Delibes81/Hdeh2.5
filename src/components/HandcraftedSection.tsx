import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function HandcraftedSection() {
  const { elementRef, isVisible } = useIntersectionObserver();

  const images = [
    {
      src: '/images/IMG_1459.jpg.webp',
      alt: 'Detalle artesanal 1',
    },
    {
      src: '/images/Captura%202026-02-24%20205114_1.1.1.jpg.webp',
      alt: 'Detalle artesanal 2',
    },
    {
      src: '/images/DSC09623.jpg.webp',
      alt: 'Detalle artesanal 3',
    }
  ];

  return (
    <section id="process" className="bg-beige overflow-hidden">
      <div className="w-full">
        <div ref={elementRef} className="grid grid-cols-3 w-full items-stretch">
          {images.map((image, index) => (
            <div
              key={index}
              className={`overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover scale-[1.02] hover:scale-[1.07] transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}