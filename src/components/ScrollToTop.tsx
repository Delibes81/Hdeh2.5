import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (!hash) {
            window.scrollTo(0, 0);
        } else {
            const element = document.getElementById(hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [pathname]);

    return null;
}
