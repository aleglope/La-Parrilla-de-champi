import { MetadataRoute } from "next";
import { i18n } from "@/i18n-config";

const BASE_URL = "https://www.laparrilladechampi.es";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/menu", "/reservas"];

  // Create an entry for each route in each language
  const sitemapEntries = routes.flatMap((route) => {
    return i18n.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }));
  });

  return sitemapEntries;
}
