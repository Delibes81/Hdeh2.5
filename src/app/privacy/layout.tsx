import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad | H de Helena',
    description: 'Cómo recopilamos, usamos y protegemos tus datos personales en H de Helena.',
    openGraph: {
        title: 'Política de Privacidad | H de Helena',
        description: 'Cómo recopilamos, usamos y protegemos tus datos personales en H de Helena.',
        url: 'https://hdehelena.com/privacy',
    }
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
