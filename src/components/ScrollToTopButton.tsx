import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`flex items-center justify-center w-12 h-12 bg-charcoal text-cream rounded-full shadow-lg hover:bg-warm-gray transition-all duration-300 hover:scale-110 z-50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
            aria-label="Volver arriba"
        >
            <ArrowUp size={24} />
        </button>
    );
}
