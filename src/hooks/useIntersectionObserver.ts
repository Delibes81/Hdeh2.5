import { useEffect, useState, useCallback } from 'react';

export function useIntersectionObserver({
    root = null,
    rootMargin = '50px',
    threshold = 0.1,
}: IntersectionObserverInit = {}) {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const elementRef = useCallback((node: HTMLElement | null) => {
        setElement(node);
    }, []);

    useEffect(() => {
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(element);
            }
        }, {
            threshold,
            rootMargin,
            root,
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [element, root, rootMargin, threshold]);

    return { elementRef, isVisible };
}
