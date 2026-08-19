import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tienda | H de Helena',
    description: 'Explora nuestra colección completa de zapatos de piel artesanales.',
    openGraph: {
        title: 'Tienda | H de Helena',
        description: 'Explora nuestra colección completa de zapatos de piel artesanales.',
        url: 'https://hdehelena.com/shop',
    }
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
