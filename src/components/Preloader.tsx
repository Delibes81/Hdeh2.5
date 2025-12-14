import { useEffect, useState } from 'react';

interface PreloaderProps {
    onFinish: () => void;
}

export default function Preloader({ onFinish }: PreloaderProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Simulate loading time or wait for resources
        const timer = setTimeout(() => {
            setIsExiting(true);
            // Wait for exit animation to finish before calling onFinish
            setTimeout(onFinish, 800); // Match duration with CSS transition
        }, 2000); // Show preloader for 2 seconds

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center bg-cream transition-opacity duration-800 ease-in-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            <div className="text-center">
                <img
                    src="/logo.png"
                    alt="H de Helena"
                    className="h-32 md:h-48 w-auto animate-pulse object-contain block mx-auto"
                />
                <div className="mt-4 h-px w-24 bg-charcoal/30 mx-auto animate-scale-in"></div>
                <p className="mt-4 text-[#5D4037] font-light tracking-widest text-sm uppercase animate-fade-in-up">
                    Artesanía & Elegancia
                </p>
            </div>
        </div>
    );
}
