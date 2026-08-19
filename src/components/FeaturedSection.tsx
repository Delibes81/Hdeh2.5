import { Product } from '../types';

interface FeaturedSectionProps {
  onAddToCart?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export default function FeaturedSection(_props: FeaturedSectionProps) {
  return (
    <section className="w-full bg-stone overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto block"
      >
        <source src="/Video/video-helena.webm" type="video/webm" />
      </video>
    </section>
  );
}