/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Servir las fotos directo desde Supabase, sin el optimizador de Vercel:
    // al rebasar el límite de transformaciones del plan, los tamaños nuevos
    // (foto principal, foto del hover) dejaban de cargar.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sejqzgqgvdbfczjvujfd.supabase.co',
      },
    ],
  },
};

export default nextConfig;
