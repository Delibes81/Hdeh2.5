import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cuidados y Mantenimiento | H de Helena',
    description: 'Guía para cuidar tus zapatos de piel y mantenerlos como nuevos.',
    openGraph: {
        title: 'Cuidados y Mantenimiento | H de Helena',
        description: 'Guía para cuidar tus zapatos de piel y mantenerlos como nuevos.',
        url: 'https://hdehelena.com/care',
    }
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
