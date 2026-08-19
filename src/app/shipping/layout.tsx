import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Envíos y Entregas | H de Helena',
    description: 'Información sobre nuestros métodos de envío, tiempos y costos.',
    openGraph: {
        title: 'Envíos y Entregas | H de Helena',
        description: 'Información sobre nuestros métodos de envío, tiempos y costos.',
        url: 'https://hdehelena.com/shipping',
    }
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
