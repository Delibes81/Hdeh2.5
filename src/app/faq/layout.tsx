import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes | H de Helena',
    description: 'Resuelve tus dudas sobre envíos, tallas, devoluciones y más.',
    openGraph: {
        title: 'Preguntas Frecuentes | H de Helena',
        description: 'Resuelve tus dudas sobre envíos, tallas, devoluciones y más.',
        url: 'https://hdehelena.com/faq',
    }
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
