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

  /**
   * Horarios de apertura. Fuente única.
   *
   * Estaban copiados a mano en cuatro sitios (pie, FAQ, /llms.txt y el schema)
   * y llegaron a divergir: /reservas anunciaba "Martes a Domingo, 12:00-23:30",
   * que ni es la hora de apertura ni refleja que hay dos turnos con cuatro
   * horas de cierre en medio.
   *
   * De aquí sale el `openingHoursSpecification` del schema. Los textos en prosa
   * siguen en translations.ts porque tienen que sonar naturales en cada idioma,
   * pero un test comprueba que las horas coinciden con estas (ver
   * __tests__/config/business.test.ts): si alguien cambia un turno aquí y se
   * olvida de la prosa, falla el build.
   *
   * Nombres de día en inglés porque es lo que exige Schema.org.
   */
  hours: {
    lunch: {
      days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
      opens: "13:00",
      closes: "16:00",
    },
    dinner: {
      days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "20:00",
      closes: "23:30",
    },
    /** Día de cierre completo. */
    closed: "Monday",
  },

  /** Ficha en Google Maps: enlazarla es una señal directa de SEO local. */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=La+parrilla+de+Champi+Noia",

  social: {
    instagram: "https://www.instagram.com/laparrilladechampi",
    tiktok: "https://tiktok.com/@champimuros",
  },
} as const;
