import { WithContext, Restaurant, Menu, BreadcrumbList } from "schema-dts";
import type { Category, Dish } from "../types"; // Adjusted path to types

// ... (previous code)

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
      item: `https://www.laparrilladechampi.es${item.item}`,
    })),
  };
}

export const restaurantSchema: WithContext<Restaurant> = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "La Parrilla de Champi",
  image: [
    "https://www.laparrilladechampi.es/Logo-Bento-Hero.svg",
    "https://www.laparrilladechampi.es/LOGO-CHAMPI-PNG-SOLO.png",
  ],
  "@id": "https://www.laparrilladechampi.es",
  url: "https://www.laparrilladechampi.es",
  telephone: "+34711224328",
  priceRange: "€€-€€€",
  servesCuisine: ["Asador", "Carnes", "Cocina Gallega"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rúa Galicia, 25",
    addressLocality: "Noia",
    addressRegion: "A Coruña",
    postalCode: "15200",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.7857,
    longitude: -8.8878,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
      opens: "13:00",
      closes: "16:00",
      validFrom: "2024-01-01",
      validThrough: "2025-12-31",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "20:00",
      closes: "23:30",
      validFrom: "2024-01-01",
      validThrough: "2025-12-31",
    },
  ],
  menu: "https://www.laparrilladechampi.es/menu",
  acceptsReservations: "True",
  sameAs: [
    "https://www.instagram.com/laparrilladechampi",
    "https://tiktok.com/@champimuros",
  ],
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
