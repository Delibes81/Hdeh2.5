import type { Metadata } from 'next';
import { Inter, Libre_Bodoni, Montserrat } from 'next/font/google';
import { CartProvider } from '../context/CartContext';
import '../index.css';
import ClientLayout from './ClientLayout';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';



const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const libreBodoni = Libre_Bodoni({
  subsets: ['latin'],
  variable: '--font-libre-bodoni',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

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
    <html lang="es" className={`${inter.variable} ${libreBodoni.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <CartProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </CartProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
