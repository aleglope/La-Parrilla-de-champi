import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Rastreadores de IA declarados uno a uno.
 *
 * Con el comodín `*` ya estaban todos permitidos, así que esto no cambia nada
 * hoy. Se hace explícito para que no se rompa por accidente: el día que
 * alguien añada un `Disallow` al grupo `*` para frenar un scraper, bloquearía
 * de paso a GPTBot, ClaudeBot y compañía sin darse cuenta.
 *
 * Para un asador de pueblo interesa que TODOS entren. Aquí no hay contenido
 * monetizable que proteger: el negocio no compite por tráfico de contenido,
 * compite por que lo mencionen cuando alguien pregunta dónde comer en Noia.
 */
const BOTS_DE_IA = [
  "GPTBot", // entrenamiento de OpenAI
  "OAI-SearchBot", // respuestas en vivo de ChatGPT Search
  "ChatGPT-User", // navegación a petición del usuario
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended", // permiso para AI Overviews y Gemini, distinto de Googlebot
  "Applebot-Extended", // permiso para Apple Intelligence
  "CCBot", // Common Crawl: base de datasets de terceros
  "Bingbot", // alimenta Bing y Copilot
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // El panel vive bajo el segmento de idioma ("/es/admin"), así que
        // "/admin/" solo no lo cubre: hace falta el comodín del idioma. Se
        // mantienen las variantes sin idioma por si alguna URL antigua sigue viva.
        disallow: ["/*/admin/", "/*/admin", "/admin/", "/admin", "/api/"],
      },
      ...BOTS_DE_IA.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/*/admin/", "/*/admin", "/admin/", "/admin", "/api/"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
