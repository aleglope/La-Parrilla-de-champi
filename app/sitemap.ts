import { MetadataRoute } from "next";
import { i18n } from "@/i18n-config";
import { SITE_URL } from "@/lib/seo/site";
import { RESERVAS_ONLINE_VISIBLES } from "@/lib/config/features";

export default function sitemap(): MetadataRoute.Sitemap {
  // /reservas sigue existiendo, pero mientras esté oculta no hay ni un enlace
  // interno que lleve a ella: anunciarla en el sitemap la convierte en una
  // página huérfana que promete algo que la web no ofrece.
  const routes = ["", "/menu", ...(RESERVAS_ONLINE_VISIBLES ? ["/reservas"] : [])];

  // Create an entry for each route in each language
  const sitemapEntries = routes.flatMap((route) => {
    return i18n.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }));
  });

  return sitemapEntries;
}
