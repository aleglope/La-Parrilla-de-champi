/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // ISR - Incremental Static Regeneration
  // Nota: optimizeCss desactivado temporalmente por compatibilidad con Windows
  // experimental: {
  //   optimizeCss: true,
  // },
};

export default nextConfig;

