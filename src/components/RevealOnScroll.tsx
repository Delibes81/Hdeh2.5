import { useEffect, useRef, useState } from 'react';

interface RevealOnScrollProps {
    children: React.ReactNode;
    animation?: string;
    duration?: string;
    delay?: string;
    threshold?: number;
    className?: string;
}

export default function RevealOnScroll({
    children,
    animation = 'animate-fade-in-up',
    duration = '0.8s',
    delay = '0s',
    threshold = 0.1,
    className = ''
}: RevealOnScrollProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={`${className} ${isVisible ? animation : ''}`}
            style={{
                opacity: isVisible ? undefined : 0,
                animationDuration: duration,
                animationDelay: delay,
                animationFillMode: 'forwards'
            }}
        >
            {children}
        </div>
    );
}
