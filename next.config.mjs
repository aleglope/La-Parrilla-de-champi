import { withSentryConfig } from "@sentry/nextjs";

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
  experimental: {
    // optimizeCss: true,
    // Requerido en Next 13.2-14 para que Next llame a register() de instrumentation.ts
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        // Cabeceras base para todo el sitio
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // El panel admin no debe poder embeberse: la cookie de sesión es
        // sameSite "lax", que no impide el enmarcado, así que sin esto se
        // puede hacer clickjacking sobre sus botones con el admin logueado.
        source: "/:lang/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  // Sin SENTRY_AUTH_TOKEN no se intenta subir source maps:
  // evita el warning de auth token y mantiene el build verde sin env vars de Sentry.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});

