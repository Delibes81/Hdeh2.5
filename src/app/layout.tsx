import type { Metadata } from 'next';
import { CartProvider } from '../context/CartContext';
import '../index.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'H de Helena | Zapatos de Piel',
  description: 'Zapatos de piel artesanales. Descubre nuestra colección exclusiva de calzado hecho a mano.',
  openGraph: {
    title: 'H de Helena | Zapatos de Piel',
    description: 'Zapatos de piel artesanales. Descubre nuestra colección exclusiva de calzado hecho a mano.',
    type: 'website',
    url: 'https://hdehelena.com/',
    images: [{ url: 'https://hdehelena.com/images/logo.png' }]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <CartProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </CartProvider>
      </body>
    </html>
  );
}
