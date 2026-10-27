import type { Locale } from "@/i18n-config";

// Madrid: 27 October 00:00 through 12 November 00:00 (exclusive).
export const VACACIONES_START = new Date("2026-10-26T23:00:00Z");
export const VACACIONES_END = new Date("2026-11-11T23:00:00Z");
export const VACACIONES_RETURN_DATE = "2026-11-12";

/** Request-time vacation window, ending before reopening on 12 November in Madrid. */
export function isVacacionesActiva(now: Date = new Date()): boolean {
  return now >= VACACIONES_START && now < VACACIONES_END;
}

export const VACACIONES_TEXTS = {
  es: {
    title: "Estamos de vacaciones",
    eyebrow: "Una pequeña pausa, las mismas ganas",
    headingStart: "Estamos de",
    headingEnd: "vacaciones.",
    description: "Hasta las brasas necesitan un descanso.",
    detail: "Nos tomamos unos días para volver con las pilas cargadas y seguir compartiendo buenos momentos contigo.",
    returnLabel: "Volvemos el",
    returnDateFull: "Volvemos el 12 de noviembre de 2026",
    monthPrefix: "de",
    month: "noviembre",
    badge: "Modo descanso: ON",
    footer: "Nos vemos pronto, alrededor de la mesa.",
    menu: "Mientras tanto, echa un vistazo a la carta",
    menuShort: "Ver la carta",
    language: "Idioma",
    imageAlt: "Champi, con el pelo azul y la barba de nuestro logo, descansando en una hamaca bajo una sombrilla naranja junto a su maleta.",
  },
  gl: {
    title: "Estamos de vacacións",
    eyebrow: "Unha pequena pausa, as mesmas ganas",
    headingStart: "Estamos de",
    headingEnd: "vacacións.",
    description: "Ata as brasas precisan un descanso.",
    detail: "Tomamos uns días para volver coas pilas cargadas e seguir compartindo bos momentos contigo.",
    returnLabel: "Voltamos o",
    returnDateFull: "Voltamos o 12 de novembro de 2026",
    monthPrefix: "de",
    month: "novembro",
    badge: "Modo descanso: ON",
    footer: "Vémonos axiña, arredor da mesa.",
    menu: "Mentres tanto, bótalle unha ollada á carta",
    menuShort: "Ver a carta",
    language: "Idioma",
    imageAlt: "Champi, co pelo azul e a barba do noso logo, descansando nunha hamaca baixo unha parasola laranxa xunto á súa maleta.",
  },
} satisfies Record<Locale, Record<string, string>>;
