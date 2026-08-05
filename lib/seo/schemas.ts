import { WithContext, Restaurant, Menu, BreadcrumbList } from "schema-dts";
import type { Category, Dish } from "../types"; // Adjusted path to types
import { SITE_URL } from "./site";
import { BUSINESS } from "../config/business";
import { i18n } from "../../i18n-config";

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

export const restaurantSchema: WithContext<Restaurant> = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: BUSINESS.name,
  image: [
    `${SITE_URL}/Logo-Bento-Hero.svg`,
    `${SITE_URL}/LOGO-CHAMPI-PNG-SOLO.png`,
  ],
  "@id": SITE_URL,
  url: SITE_URL,
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
  // Sin validFrom/validThrough: el horario es permanente, no una excepción con
  // fecha. Los valores anteriores caducaron el 2025-12-31 y desde entonces
  // Google leía el horario como vencido.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
      opens: "13:00",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "20:00",
      closes: "23:30",
    },
  ],
  // Con prefijo de idioma: "/menu" a secas provoca un 307 del middleware,
  // y el schema debe apuntar a la URL canónica, no a una redirección.
  menu: `${SITE_URL}/${i18n.defaultLocale}/menu`,
  acceptsReservations: "True",
  sameAs: [BUSINESS.social.instagram, BUSINESS.social.tiktok],
};

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
          description: dish.description || "",
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
