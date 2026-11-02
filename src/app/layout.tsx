import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CartProvider } from '../context/CartContext';
import '../index.css';
import ClientLayout from './ClientLayout';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';



// Fuentes incluidas en el proyecto (src/fonts) para que la compilación no
// dependa de descargar Google Fonts. Son archivos variables, subset latino.
const inter = localFont({
  src: '../fonts/inter-latin.woff2',
  variable: '--font-inter',
  weight: '300 600',
  style: 'normal',
  display: 'swap',
});

const libreBodoni = localFont({
  src: [
    { path: '../fonts/libre-bodoni-latin.woff2', weight: '400 700', style: 'normal' },
    { path: '../fonts/libre-bodoni-italic-latin.woff2', weight: '400 700', style: 'italic' },
  ],
  variable: '--font-libre-bodoni',
  display: 'swap',
});

const montserrat = localFont({
  src: [
    { path: '../fonts/montserrat-latin.woff2', weight: '100 900', style: 'normal' },
    { path: '../fonts/montserrat-italic-latin.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hdehelena.com'),
  title: 'H de Helena | Zapatos de Piel',
  description: 'Zapatos de piel artesanales. Descubre nuestra colección exclusiva de calzado hecho a mano.',
  openGraph: {
    title: 'H de Helena | Zapatos de Piel',
    description: 'Zapatos de piel artesanales. Descubre nuestra colección exclusiva de calzado hecho a mano.',
    type: 'website',
    url: 'https://hdehelena.com/',
    images: [{ url: 'https://hdehelena.com/images/logo.png' }]
  },
  verification: {
    google: 'WTJb_ScO0jfd2yDlrdiSYS54-6vPMUuRS41Rn6YGz10',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${libreBodoni.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </CartProvider>
        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics gaId="G-2EBDHM951Y" />
      </body>
    </html>
  );
}
