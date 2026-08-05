import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El panel vive bajo el segmento de idioma ("/es/admin"), así que
      // "/admin/" solo no lo cubre: hace falta el comodín del idioma. Se
      // mantienen las variantes sin idioma por si alguna URL antigua sigue viva.
      disallow: ["/*/admin/", "/*/admin", "/admin/", "/admin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
