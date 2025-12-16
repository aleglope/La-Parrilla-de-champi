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
    "https://www.laparrilladechampi.es/images/parrilla.svg",
    "https://www.laparrilladechampi.es/Champi Logo.png",
  ],
  "@id": "https://www.laparrilladechampi.es",
  url: "https://www.laparrilladechampi.es",
  telephone: "+34 600 000 000", // Placeholder, should be updated with real phone if known or added to translations
  priceRange: "€€",
  servesCuisine: ["Barbecue", "Galician", "Spanish"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dirección principal", // Placeholder
    addressLocality: "Noia",
    addressRegion: "A Coruña",
    postalCode: "15200",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.785, // Placeholder for Noia center
    longitude: -8.889,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "13:00",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "20:00",
      closes: "23:00",
    },
  ],
  menu: "https://www.laparrilladechampi.es/menu",
  acceptsReservations: "True",
  sameAs: [
    "https://www.instagram.com/laparrilladechampi", // Placeholder
    "https://www.facebook.com/laparrilladechampi", // Placeholder
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
