import { useEffect, useState, useCallback } from 'react';

export function useIntersectionObserver(options = {}) {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const elementRef = useCallback((node: HTMLElement | null) => {
        if (node) {
            setElement(node);
        }
    }, []);

    useEffect(() => {
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(element);
            }
        }, {
            threshold: 0.1,
            rootMargin: '50px',
            ...options
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [element]);

    return { elementRef, isVisible };
}
