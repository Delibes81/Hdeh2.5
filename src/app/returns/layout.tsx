import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cambios y devoluciones | H de Helena',
    description: 'Política de cambios y devoluciones de H de Helena.',
    openGraph: {
        title: 'Cambios y devoluciones | H de Helena',
        description: 'Política de cambios y devoluciones de H de Helena.',
        url: 'https://hdehelena.com/returns',
    }
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
