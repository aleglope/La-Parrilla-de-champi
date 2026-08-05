/**
 * Datos de la sección de prueba social (reseñas de Google).
 *
 * Agregado real verificado en Google Maps (agosto 2026):
 * La parrilla de Champi, Noia — 4,7 ★ y 171 reseñas.
 * Si cambia, actualizar RATING / REVIEW_COUNT.
 */
export const RATING = 4.7;
export const REVIEW_COUNT = 171;
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=La+parrilla+de+Champi+Noia";

export interface Review {
  readonly author: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly text: string;
  readonly date: string;
  /** Foto subida por el propio cliente a su reseña de Google */
  readonly image: string;
  readonly imageAlt: string;
  /**
   * Encuadre del recorte (CSS object-position). Las fotos son verticales y el
   * panel es estrecho: sin esto, `object-fit: cover` centra en 50% 50% y parte
   * el plato por la mitad en varias de ellas.
   */
  readonly objectPosition?: string;
}

// Textos reales extraídos de la ficha de Google Maps el 5-ago-2026, con los
// "Ver más" expandidos uno a uno: son citas literales, sin retocar la
// ortografía ni el tono de quien las escribió.
// Las fotos son las que cada cliente subió a su reseña de Google
// (carpeta _fotos-google, ver _manifest.json).
//
// La de Patricia Touza va recortada a propósito en su primera parte. El texto
// completo continúa con un matiz sobre el criollo ("para mi gusto demasiado
// especiado") — la cita es fiel a lo que dijo, pero está abreviada.
//
// Dani R escribió la suya en gallego; se respeta tal cual en ambos idiomas.
export const reviews: readonly Review[] = [
  {
    author: "Juan A. Martinez",
    rating: 5,
    text: "Todo correcto y muy rico. La atención de diez y la carne en su punto. Nos decidimos por la parrillada de Champi y fue un acierto total. Viene bastante completa, con una buena variedad de carnes entre ellos churrasco de ternera y de cerdo, chorizos, croca... Muy bien de cantidad y de sabor. ¡Sin duda, muy recomendable!",
    date: "Hace 2 semanas",
    image: "/images/reviews/juan-a-martinez.jpg",
    imageAlt: "Parrillada de carne a la brasa en tabla: costillar, chuletas, entrecot y chorizo con sal gruesa, y patatas fritas al fondo",
    objectPosition: "40% 50%",
  },
  {
    author: "Oscar Filgueira Otero",
    rating: 5,
    text: "Recomiendo. Se come increíblemente bien. Hay que reservar porque tiene poco sitio. Las croquetas de buey están espectaculares.",
    date: "Hace 7 meses",
    image: "/images/reviews/oscar-filgueira-otero.jpg",
    imageAlt: "Porción de tarta de chocolate con cobertura de ganache y frutos secos, servida en plato de cerámica",
    // Foto sustituida (5-ago-2026): la anterior era la tarta de queso del
    // mismo cliente, pero llevaba una vela de cumpleaños clavada y una lata
    // de refresco en el encuadre. Esta es suya también (dic-2025) y no
    // necesita retoque: solo se recortó por la derecha para dejar fuera la
    // mano de un comensal. La tarta queda en el tercio superior.
    objectPosition: "50% 30%",
  },
  {
    author: "Patricia Touza",
    rating: 5,
    text: "Muy buena. El servicio genial, se nota que hay un buen ambiente entre los trabajadores, muy agradables y el lugar agradable tambien. Nos pedimos unas croquetas de rabo de toro muy ricas y la parrillada de Champi muy buena.",
    date: "Hace 5 meses",
    image: "/images/reviews/patricia-touza.jpg",
    imageAlt: "Fuente metálica de parrillada a la brasa con costillas, chorizo, morcilla y tiras de carne de cerdo",
    objectPosition: "25% 25%",
  },
  {
    author: "Dani R",
    rating: 5,
    text: "Moi bo trato e a comida de 10! Repetiremos!",
    date: "Hace 2 meses",
    image: "/images/reviews/dani-r.jpg",
    imageAlt: "Fuente de zamburiñas a la plancha servidas en su concha, con aceite de ajo y perejil y sal en escamas",
    objectPosition: "50% 55%",
  },
  {
    author: "RODRI DEL RIO",
    rating: 5,
    text: "Una carne de muy buena calidad, hecha con mimo y al punto exacto. El servicio ha sido de 10, muy atentos y el parrillero se ha preocupado en preguntar si todo había salido a nuestro gusto. RECOMENDABLE RESERVAR PARA QUE PUEDAN ATEMPERAR LA CARNE",
    date: "Hace 4 semanas",
    image: "/images/reviews/rodri-del-rio.jpg",
    imageAlt: "Chuletón con hueso sobre tabla de madera en una báscula que marca 1.481 gramos",
    objectPosition: "50% 50%",
  },
  {
    author: "Emma Gómez Delgado",
    rating: 5,
    text: "SIMPLEMENTE ESPECTACULO, FANTASIA. Todo buenisimo. El servicio de los chicos increible, el sitio tranquilo y precioso. Repetiria una y mil veces! A por mas exitos chicos!!!",
    date: "Hace 4 meses",
    image: "/images/reviews/emma-gomez-delgado.jpg",
    imageAlt: "Ración de tarta casera por capas de nata y galleta, con cacao espolvoreado y cobertura de chocolate",
    objectPosition: "58% 60%",
  },
];
