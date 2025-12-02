/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configuración de patrones remotos para imágenes de Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Formatos optimizados (WebP es el principal para nuestras imágenes)
    formats: ['image/avif', 'image/webp'],
    // Desactivar optimización de Vercel para mantenernos en tier gratuito
    // Las imágenes ya vienen optimizadas desde el cliente (browser-image-compression)
    unoptimized: false, // Mantener en false para desarrollo local, las imágenes usan unoptimized={true} individualmente
    // Device sizes para responsive images
    deviceSizes: [640, 750, 828, 1080, 1200],
    // Image sizes para componente Image con sizes prop
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // ISR - Incremental Static Regeneration
  // Nota: optimizeCss desactivado temporalmente por compatibilidad con Windows
  // experimental: {
  //   optimizeCss: true,
  // },
};

export default nextConfig;

