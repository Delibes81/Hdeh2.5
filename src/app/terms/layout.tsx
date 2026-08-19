import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones | H de Helena',
    description: 'Condiciones generales de uso y venta de H de Helena.',
    openGraph: {
        title: 'Términos y Condiciones | H de Helena',
        description: 'Condiciones generales de uso y venta de H de Helena.',
        url: 'https://hdehelena.com/terms',
    }
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
