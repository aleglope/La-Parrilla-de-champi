/**
 * Datos del negocio: nombre, dirección, teléfono y redes.
 *
 * Fuente única para el NAP (Name, Address, Phone). Lo consumen a la vez el
 * bloque visible del pie y el JSON-LD de `lib/seo/schemas.ts`: para el SEO
 * local es imprescindible que digan exactamente lo mismo, y tenerlo escrito
 * dos veces garantiza que antes o después dejen de coincidir.
 */
export const BUSINESS = {
  name: "La Parrilla de Champi",

  phone: {
    /** Como se muestra al usuario. */
    display: "711 22 43 28",
    /** Formato E.164 para href="tel:". */
    tel: "+34711224328",
  },

  address: {
    street: "Rúa Galicia, 25",
    postalCode: "15200",
    locality: "Noia",
    region: "A Coruña",
    country: "ES",
  },

  geo: {
    latitude: 42.7857,
    longitude: -8.8878,
  },

  /** Ficha en Google Maps: enlazarla es una señal directa de SEO local. */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=La+parrilla+de+Champi+Noia",

  social: {
    instagram: "https://www.instagram.com/laparrilladechampi",
    tiktok: "https://tiktok.com/@champimuros",
  },
} as const;
