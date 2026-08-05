/**
 * Prefija una ruta interna con el idioma activo.
 *
 * Sin esto, un `href="/menu"` desde la versión gallega provoca un 307 del
 * middleware a `/es/menu`: el usuario gallego acaba en castellano y las
 * páginas `/gl/*` quedan huérfanas — están en el sitemap pero no las enlaza
 * nadie, que es la peor combinación posible para el SEO.
 *
 * @param lang  Idioma activo ("es", "gl").
 * @param path  Ruta interna que empieza por "/". Admite ancla: "/#story".
 *              Cualquier otra cosa (ancla suelta, URL absoluta, tel:, mailto:)
 *              se devuelve intacta.
 */
export function localeHref(lang: string, path: string): string {
  if (!path.startsWith("/")) return path;

  const [pathname, hash] = path.split("#");
  // "/" no debe producir "/es/", que redirige otra vez.
  const cleanPath = pathname === "/" ? "" : pathname.replace(/\/$/, "");

  return `/${lang}${cleanPath}${hash ? `#${hash}` : ""}`;
}
