export const i18n = {
  defaultLocale: "es",
  locales: ["es", "gl"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

/**
 * El segmento `[lang]` acepta cualquier cadena, así que rutas como `/llms.txt`
 * entraban como idioma y devolvían la home entera con `<html lang="llms.txt">`.
 * El middleware no las filtra: su matcher excluye todo lo que lleve un punto.
 */
export function isValidLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}
