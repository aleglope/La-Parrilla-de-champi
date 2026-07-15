import type { WithContext, Menu } from "schema-dts";

/**
 * Modo Feria Medieval — XXVII Feira Medieval Vila de Noia (17·18·19 julio 2026).
 *
 * Módulo autocontenido: ventana de activación por fecha, datos del menú del
 * evento (es/gl), textos de UI y JSON-LD. Inerte fuera de la ventana.
 * Reutilizable en futuras ediciones cambiando solo constantes.
 */

// Ventana del evento en instantes UTC (fuente de verdad, independiente de la TZ del servidor).
// Equivale a viernes 17/07 17:00 → domingo 19/07 23:59 hora Madrid (CEST, UTC+2).
export const FERIA_START = new Date("2026-07-17T15:00:00Z");
export const FERIA_END = new Date("2026-07-19T22:00:00Z");

/**
 * Indica si la feria está activa en el instante dado.
 * Inicio inclusivo, fin exclusivo. `now` inyectable para tests.
 */
export function isFeriaActiva(now: Date = new Date()): boolean {
  return now >= FERIA_START && now < FERIA_END;
}

export interface MedievalDish {
  id: string;
  name: string;
  name_gl: string;
  description: string;
  description_gl: string;
  price: number;
}

/** Carta del evento — textos es/gl del diseño aprobado. Sin fotos. */
export const MEDIEVAL_DISHES: MedievalDish[] = [
  {
    id: "pulpo-a-feira",
    name: "Pulpo á feira",
    name_gl: "Polbo á feira",
    description:
      "El clásico de las ferias: pulpo tierno con pimentón, sal gruesa y aceite de oliva",
    description_gl:
      "O clásico das feiras: polbo tenro con pementón, sal groso e aceite de oliva",
    price: 25.0,
  },
  {
    id: "churrasco-ternera",
    name: "Churrasco de ternera",
    name_gl: "Churrasco de tenreira",
    description:
      "Costilla de ternera asada despacio sobre las brasas de la parrilla",
    description_gl:
      "Costela de tenreira asada amodo sobre as brasas da parrilla",
    price: 20.0,
  },
  {
    id: "churrasco-cerdo",
    name: "Churrasco de cerdo",
    name_gl: "Churrasco de porco",
    description:
      "Churrasco de cerdo dorado a la brasa, como en los banquetes de antaño",
    description_gl:
      "Churrasco de porco dourado á brasa, coma nos banquetes de antano",
    price: 20.0,
  },
  {
    id: "mejillones",
    name: "Mejillones",
    name_gl: "Mexillóns",
    description: "Mejillones de la ría, frescos del mar de Noia",
    description_gl: "Mexillóns da ría, frescos do mar de Noia",
    price: 15.0,
  },
  {
    id: "pimientos",
    name: "Pimientos",
    name_gl: "Pementos",
    description: "Pimientos verdes con sal gruesa — unos pican y otros no",
    description_gl: "Pementos verdes con sal groso — uns pican e outros non",
    price: 10.0,
  },
  {
    id: "criollo",
    name: "Criollo",
    name_gl: "Criollo",
    description: "Chorizo criollo a la brasa, jugoso y especiado",
    description_gl: "Chourizo crioulo á brasa, zumento e especiado",
    price: 3.5,
  },
  {
    id: "chorizo-rojo",
    name: "Chorizo rojo",
    name_gl: "Chourizo vermello",
    description: "Chorizo gallego a la brasa, con sabor a humo de leña",
    description_gl: "Chourizo galego á brasa, con sabor a fume de leña",
    price: 3.5,
  },
  {
    id: "patatas-fritas",
    name: "Patatas fritas",
    name_gl: "Patacas fritas",
    description: "Crujientes, la guarnición de todo buen festín",
    description_gl: "Crocantes, a gornición de todo bo festín",
    price: 3.5,
  },
];

/** Formatea un precio como "NN,NN €" (coma decimal, convención es/gl). */
export function formatPrice(price: number): string {
  return `${price.toFixed(2).replace(".", ",")} €`;
}

export interface FeriaTexts {
  eventName: string;
  dates: string;
  menuHeading: string;
  menuSubtitle: string;
  ctaLabel: string;
  metaTitle: string;
  metaDescription: string;
}

/** Textos del evento por idioma. Viven aquí (no en translations.ts) para mantener la feature autocontenida. */
export const FERIA_TEXTS: Record<"es" | "gl", FeriaTexts> = {
  es: {
    eventName: "XXVII Feira Medieval Vila de Noia",
    dates: "17·18·19 de julio",
    menuHeading: "Menú de la Feria Medieval",
    menuSubtitle: "Brasas y sabores de antaño en las calles de Noia",
    ctaLabel: "Ver el menú de la feria",
    metaTitle: "Menú Feria Medieval | La Parrilla de Champi",
    metaDescription:
      "Menú especial de la XXVII Feira Medieval Vila de Noia: pulpo á feira, churrasco a la brasa y sabores de feria, del 17 al 19 de julio.",
  },
  gl: {
    eventName: "XXVII Feira Medieval Vila de Noia",
    dates: "17·18·19 de xullo",
    menuHeading: "Menú da Feira Medieval",
    menuSubtitle: "Brasas e sabores de antano nas rúas de Noia",
    ctaLabel: "Ver o menú da feira",
    metaTitle: "Menú Feira Medieval | La Parrilla de Champi",
    metaDescription:
      "Menú especial da XXVII Feira Medieval Vila de Noia: polbo á feira, churrasco á brasa e sabores de feira, do 17 ao 19 de xullo.",
  },
};

/**
 * JSON-LD del menú medieval (schema.org/Menu) para la página del menú en modo feria.
 * No toca lib/seo/schemas.ts; la bifurcación de cuál schema se usa ocurre en la página.
 */
export function generateMedievalMenuSchema(
  lang: "es" | "gl"
): WithContext<Menu> {
  const texts = FERIA_TEXTS[lang];
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: texts.menuHeading,
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: texts.eventName,
        hasMenuItem: MEDIEVAL_DISHES.map((dish) => ({
          "@type": "MenuItem",
          name: lang === "gl" ? dish.name_gl : dish.name,
          description: lang === "gl" ? dish.description_gl : dish.description,
          offers: {
            "@type": "Offer",
            price: dish.price,
            priceCurrency: "EUR",
          },
        })),
      },
    ],
  };
}
