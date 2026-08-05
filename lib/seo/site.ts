import { i18n, type Locale } from "@/i18n-config";

/**
 * Host canónico del sitio, sin barra final.
 *
 * El apex y el subdominio www sirven ambos la web. El apex es el canónico:
 * es a donde redirige la raíz y lo que usa `metadataBase`. Todo lo que emita
 * URLs absolutas (robots, sitemap, JSON-LD, Open Graph) debe leerlas de aquí
 * para que no vuelvan a desalinearse.
 *
 * Requiere el 308 de www → apex configurado en Vercel → Domains.
 */
export const SITE_URL = "https://laparrilladechampi.es";

/**
 * Construye `canonical` + `hreflang` para una ruta sin prefijo de idioma.
 *
 * @param lang  Idioma de la página que se está renderizando.
 * @param path  Ruta sin idioma y sin barra final: "" para la home, "/menu"…
 */
export function localeAlternates(lang: Locale, path: string = "") {
  const languages: Record<string, string> = {};

  for (const locale of i18n.locales) {
    languages[locale] = `/${locale}${path}`;
  }

  // Sin x-default, un buscador que no reconoce ni "es" ni "gl" no sabe qué
  // versión servir. Apunta al idioma por defecto.
  languages["x-default"] = `/${i18n.defaultLocale}${path}`;

  return {
    canonical: `/${lang}${path}`,
    languages,
  };
}
