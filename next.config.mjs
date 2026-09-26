import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // En producción no se emiten console.log ni console.info/debug: los de los
    // componentes de cliente acababan en la consola del visitante. Se conservan
    // error y warn, que son los que Sentry recoge como breadcrumbs y los que
    // sirven para diagnosticar en los logs de Vercel.
    //
    // Contrapartida: también desaparecen los console.log informativos de las
    // Server Actions de imágenes ("[Upload] Éxito: …"). Si algún día hacen
    // falta en producción, el camino es pasarlos a console.warn o a Sentry,
    // no reactivar todos los logs.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    // Configuración de patrones remotos para imágenes de Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Solo WebP. Vercel cobra cada variante (foto × ancho × formato) como una
    // transformación aparte, y con AVIF + WebP cada foto de la carta se
    // transformaba el doble de veces. Los originales ya se suben en WebP.
    formats: ['image/webp'],
    // Cuánto guarda Vercel cada variante optimizada antes de volver a
    // transformarla: el MAYOR entre este valor y el max-age que mande el
    // origen. El valor por defecto (60 s) era el problema: muchas fotos del
    // bucket tienen un Cache-Control que no es un max-age válido ("31536000"
    // a secas o "no-cache"), así que Vercel las daba por caducadas al minuto y
    // cada visita posterior contaba como transformación y escritura de caché
    // nuevas. En los logs de Supabase se veía como ~850 peticiones diarias de
    // vercel-image-optimization, 30-40 por foto, solo en esas fotos.
    //
    // 31 días (el máximo que retiene Vercel) es seguro porque cada subida
    // genera un nombre de fichero nuevo (timestamp + sufijo aleatorio): una
    // foto cambiada es otra URL y nunca se sirve la vieja.
    minimumCacheTTL: 2678400,
    // El optimizador de imágenes está ACTIVO, y es quien sirve las fotos de la
    // carta pública. El motivo es medido: servir las 79 fotos de los platos
    // directamente desde el CDN de Supabase generaba 5-8 GB/mes de egress
    // cacheado contra los 5 GB que incluye su plan gratuito. Pasando por
    // /_next/image, Vercel va al origen una vez por variante (y de nuevo solo
    // cuando vence minimumCacheTTL) y sirve el resto desde su edge.
    //
    // El `remotePatterns` de arriba es lo que autoriza ese origen: sin él, Next
    // rechaza la URL con un 400 en vez de hacer de proxy abierto.
    //
    // Quien se salta el optimizador lo hace por caso concreto, con el prop en
    // la propia imagen, y no desde esta clave global: hoy solo los dos
    // componentes de components/admin/, cada uno por su razón (ver allí).
    unoptimized: false,
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
    // El body por defecto de una Server Action es 1MB, por debajo de cualquier
    // foto de móvil. Las imágenes viajan en binario dentro de un FormData, así
    // que este número es el techo real del envío.
    //
    // 4.4mb y no 4.5mb a propósito: Vercel corta el cuerpo de una función
    // serverless en 4.5MB y ese límite es infraestructura, no se puede subir.
    // Dejando 100KB de margen, quien corta es Next con un error legible en vez
    // de la plataforma con uno opaco. El cliente aprieta más aún (4.2MB, ver
    // TRANSPORT_MAX_SIZE_BYTES en utils/imageHelpers.ts).
    serverActions: {
      bodySizeLimit: "4.4mb",
    },
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
          // Antiframing en todo el sitio, no solo en /admin: /reservas sigue
          // siendo una URL pública alcanzable a mano aunque esté oculta a los
          // buscadores, y era la superficie sin proteger. SAMEORIGIN en vez de
          // DENY para no romper una futura previsualización propia.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'",
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

