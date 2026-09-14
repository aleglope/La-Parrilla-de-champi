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

  /**
   * Domicilio real del local, leído el 2026-09-07 en la ficha de Google
   * Business Profile (la gestiona la propia empresa) y contrastado con el
   * Registro Mercantil (LA PARRILLA DE CHAMPI SL, B24828030).
   *
   * Desde diciembre de 2025 y durante nueve meses aquí figuró otra calle de
   * Noia, a unos 745 m de la puerta, que nadie llegó a verificar. Las páginas
   * legales del propio sitio (/aviso-legal, /politica-privacidad) decían la
   * correcta desde el principio. La cadena antigua no se reproduce aquí a
   * propósito: hay un grep de auditoría que debe seguir devolviendo cero.
   *
   * La forma gallega "Praza do Marqués de Monroy" se usa TAL CUAL en los dos
   * idiomas, sin traducirla: es la que figura en Google y en el Registro, y el
   * SEO local exige que la cadena coincida carácter a carácter en todas partes.
   */
  address: {
    street: "Praza do Marqués de Monroy, 8, Bajo",
    postalCode: "15200",
    locality: "Noia",
    region: "A Coruña",
    country: "ES",
  },

  geo: {
    latitude: 42.7794978,
    longitude: -8.8912644,
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
   * __tests__/config/horarios.test.ts): si alguien cambia un turno aquí y se
   * olvida de la prosa, falla el build.
   *
   * Nombres de día en inglés porque es lo que exige Schema.org.
   */
  hours: {
    /**
     * Turnos que dio el dueño el 2026-09-14, al acabar la temporada alta:
     * martes cerrado y sin cenas el domingo. Manda el dueño sobre la ficha de
     * Google, que la gestiona un tercero y puede ir por detrás: si no
     * coinciden, lo que hay que corregir es la ficha.
     */
    regular: [
      {
        days: ["Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "11:00",
        closes: "16:00",
      },
      // El domingo el turno de mediodía se alarga dos horas más.
      { days: ["Sunday"], opens: "11:00", closes: "18:00" },
      {
        days: ["Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "20:00",
        // Cierra a medianoche. `closes` menor que `opens` es como Schema.org
        // expresa que el turno cruza el cambio de día.
        closes: "00:00",
      },
    ],

    /** Días de cierre completo con el horario vigente. */
    closed: ["Monday", "Tuesday"],
  },

  /**
   * Ficha en Google Maps: enlazarla es una señal directa de SEO local.
   *
   * Apunta a la ficha concreta por identificador (place_id
   * ChIJa_O3Bg8hLw0Rt2LNbTYadGs), no a una búsqueda por texto: una búsqueda
   * depende de lo que Google decida devolver ese día y puede resolver a otro
   * negocio o a nada.
   */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=La+Parrilla+de+Champi&query_place_id=ChIJa_O3Bg8hLw0Rt2LNbTYadGs",

  social: {
    instagram: "https://www.instagram.com/laparrilladechampi",
    tiktok: "https://tiktok.com/@champimuros",
  },
} as const;
