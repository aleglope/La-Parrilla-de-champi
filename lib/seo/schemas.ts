import { WithContext, Restaurant, Menu, BreadcrumbList } from "schema-dts";
import type { Category, Dish } from "../types"; // Adjusted path to types
import { SITE_URL } from "./site";
import { BUSINESS } from "../config/business";
import { i18n, type Locale } from "../../i18n-config";

export function generateBreadcrumbSchema(
  items: { name: string; item: string }[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.item}`,
    })),
  };
}

/**
 * Schema del restaurante para la página que lo incrusta.
 *
 * Es función del idioma, no una constante: `url` y `menu` deben apuntar a la
 * versión que se está sirviendo. Siendo un objeto estático, la página gallega
 * declaraba `menu` → `/es/menu` y `url` → el apex desnudo, que redirige 307.
 * `@id` sí se mantiene fijo al dominio: es el mismo restaurante en los dos
 * idiomas, no dos entidades.
 *
 * Nota sobre `image`: solo formatos que Google admite en datos estructurados
 * (BMP, GIF, JPEG, PNG, WebP). El SVG del logo que había aquí quedaba fuera.
 */
export function generateRestaurantSchema(
  lang: Locale = i18n.defaultLocale
): WithContext<Restaurant> {
  const pageUrl = `${SITE_URL}/${lang}`;
  const menuUrl = `${SITE_URL}/${lang}/menu`;

  return {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: BUSINESS.name,
  image: [`${SITE_URL}/LOGO-CHAMPI-PNG-SOLO.png`],
  "@id": SITE_URL,
  url: pageUrl,
  telephone: BUSINESS.phone.tel,
  priceRange: "€€-€€€",
  servesCuisine: ["Asador", "Carnes", "Cocina Gallega"],
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.address.street,
    addressLocality: BUSINESS.address.locality,
    addressRegion: BUSINESS.address.region,
    postalCode: BUSINESS.address.postalCode,
    addressCountry: BUSINESS.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.geo.latitude,
    longitude: BUSINESS.geo.longitude,
  },
  // Derivado de BUSINESS.hours, no copiado: era la cuarta copia literal del
  // horario y las cuatro llegaron a no decir lo mismo.
  //
  // Sin validFrom/validThrough: el horario es permanente, no una excepción con
  // fecha. Los valores anteriores caducaron el 2025-12-31 y desde entonces
  // Google leía el horario como vencido.
  openingHoursSpecification: [
    ...BUSINESS.hours.regular,
    ...BUSINESS.hours.verano,
  ].map((turno) => ({
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: [...turno.days],
    opens: turno.opens,
    closes: turno.closes,
  })),
  // Con prefijo de idioma: "/menu" a secas provoca un 307 del middleware,
  // y el schema debe apuntar a la URL canónica, no a una redirección.
  menu: menuUrl,
  hasMenu: menuUrl,
  hasMap: BUSINESS.mapsUrl,
  currenciesAccepted: "EUR",
  publicAccess: true,
  // Booleano, no la cadena "True": se sigue reservando, pero por teléfono.
  acceptsReservations: true,
  sameAs: [BUSINESS.social.instagram, BUSINESS.social.tiktok],
  };
}

/**
 * FAQPage con las mismas preguntas que se ven en la página.
 *
 * Google retiró el resultado enriquecido de FAQ en mayo de 2026, así que esto
 * NO busca estrellas ni desplegables en la SERP: es para los buscadores
 * generativos, que sí usan el marcado para desambiguar pares pregunta/respuesta.
 * El contenido debe coincidir con el visible; si no, es marcado engañoso.
 */
export function generateFaqSchema(
  items: readonly { readonly q: string; readonly a: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function generateMenuSchema(
  categories: Category[],
  dishes: Dish[]
): WithContext<Menu> {
  // Simple flat menu for now, can be sectioned by Category if needed
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Carta Principal",
    hasMenuSection: categories.map((cat) => ({
      "@type": "MenuSection",
      name: cat.name,
      hasMenuItem: dishes
        .filter((d) => d.category_id === cat.id)
        .map((dish) => ({
          "@type": "MenuItem",
          name: dish.name,
          // undefined y no "": omitir la propiedad en vez de emitirla vacía,
          // igual que ya se hace con `image`. Un tercio de los platos no tiene
          // descripción y salían 31 `"description": ""` de puro ruido.
          description: dish.description || undefined,
          offers: {
            "@type": "Offer",
            price: dish.price,
            priceCurrency: "EUR",
          },
          image: dish.image_url || undefined,
        })),
    })),
  };
}
