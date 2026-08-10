import { MetadataRoute } from "next";
import { i18n } from "@/i18n-config";
import { SITE_URL } from "@/lib/seo/site";
import { RESERVAS_ONLINE_VISIBLES } from "@/lib/config/features";

/**
 * Fecha de la última revisión real del contenido, a mano.
 *
 * Antes esto era `new Date()`, que parecía "siempre fresco" pero mentía en las
 * dos direcciones: Next genera el sitemap en build y Vercel lo cachea, así que
 * el valor se congelaba en el momento del deploy. Cualquier cambio de CSS movía
 * la fecha de todas las URLs sin que cambiara nada visible, y un cambio de
 * precio en la carta —que entra por ISR desde Supabase, sin rebuild— no la
 * movía nunca.
 *
 * Actualizar solo cuando se toque de verdad el contenido de las páginas.
 */
const ULTIMA_REVISION = new Date("2026-08-10");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/menu",
    // Indexables, con canonical y hreflang propios y enlazadas desde el pie:
    // omitirlas era una incoherencia, no una decisión.
    "/aviso-legal",
    "/politica-privacidad",
    "/politica-cookies",
    // /reservas sigue existiendo, pero mientras esté oculta no hay ni un enlace
    // interno que lleve a ella y además es noindex: anunciarla en el sitemap la
    // convierte en una página huérfana que promete algo que la web no ofrece.
    ...(RESERVAS_ONLINE_VISIBLES ? ["/reservas"] : []),
  ];

  return routes.flatMap((route) =>
    i18n.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      lastModified: ULTIMA_REVISION,
    }))
  );
}
