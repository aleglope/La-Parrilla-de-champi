import { describe, it, expect } from "vitest";
import { BUSINESS } from "@/lib/config/business";
import { generateRestaurantSchema } from "@/lib/seo/schemas";
import { translations } from "@/lib/i18n/translations";
import { GET } from "@/app/llms.txt/route";

/**
 * La dirección publicada es el centro del NAP (nombre, dirección, teléfono), la
 * señal con la que Google decide si esta web y la ficha del restaurante son el
 * mismo negocio. Se escribe en muchos sitios —el JSON-LD, /llms.txt, el pie y
 * las respuestas del FAQ en dos idiomas—, así que basta con que una copia se
 * quede atrás para que el conjunto deje de coincidir.
 *
 * Existe porque divergió de verdad: entre diciembre de 2025 y septiembre de
 * 2026 la web anunció «Rúa Galicia, 25» con unas coordenadas a unos 745 m del
 * local, mientras las propias páginas legales del sitio decían la dirección
 * correcta. Nueve meses mandando clientes al sitio equivocado sin que nadie se
 * enterara.
 *
 * Los valores esperados van escritos a mano a propósito: este test es el
 * guardián, así que no puede derivarlos de BUSINESS —si lo hiciera, pasaría
 * también cuando la fuente estuviera mal.
 *
 * Fuentes (leídas el 2026-09-07): ficha de Google Business Profile, que
 * gestiona la propia empresa, y el Registro Mercantil (LA PARRILLA DE CHAMPI
 * SL, B24828030).
 */
const CALLE = "Praza do Marqués de Monroy, 8, Bajo";
const LAT = 42.7794978;
const LON = -8.8912644;
const PLACE_ID = "ChIJa_O3Bg8hLw0Rt2LNbTYadGs";

describe("dirección: la fuente única dice lo que dice la ficha de Google", () => {
  it("BUSINESS.address es la dirección real del local", () => {
    expect(BUSINESS.address.street).toBe(CALLE);
    expect(BUSINESS.address.postalCode).toBe("15200");
    expect(BUSINESS.address.locality).toBe("Noia");
    expect(BUSINESS.address.region).toBe("A Coruña");
    expect(BUSINESS.address.country).toBe("ES");
  });

  it("las coordenadas apuntan al local, no a 745 m de distancia", () => {
    expect(BUSINESS.geo.latitude).toBe(LAT);
    expect(BUSINESS.geo.longitude).toBe(LON);
  });

  it("mapsUrl resuelve a la ficha concreta, no a una búsqueda por texto", () => {
    // Una búsqueda por texto puede resolver a otro negocio o a nada; el
    // place_id identifica la ficha sin ambigüedad.
    expect(BUSINESS.mapsUrl).toContain(PLACE_ID);
  });

  it("el JSON-LD se deriva de la fuente, no de una copia", () => {
    const schema = generateRestaurantSchema("es");

    const address = schema.address as { streetAddress: string };
    const geo = schema.geo as { latitude: number; longitude: number };

    expect(address.streetAddress).toBe(BUSINESS.address.street);
    expect(geo.latitude).toBe(BUSINESS.geo.latitude);
    expect(geo.longitude).toBe(BUSINESS.geo.longitude);
  });

  it("/llms.txt tampoco es una copia", async () => {
    const cuerpo = await GET().text();

    expect(cuerpo).toContain(CALLE);
    expect(cuerpo).toContain(BUSINESS.mapsUrl);
  });
});

/**
 * El pie y dos respuestas del FAQ escriben la dirección a mano, en dos idiomas,
 * porque tienen que sonar naturales en cada lengua y no se pueden generar del
 * todo desde los datos. Lo que sí se puede es comprobar que ninguna de esas
 * copias contradice a la fuente: eso es exactamente lo que falló durante nueve
 * meses.
 */
describe("dirección: la prosa no contradice a BUSINESS.address", () => {
  const idiomas = ["es", "gl"] as const;

  it.each(idiomas)("el pie de %s repite la cadena exacta del NAP", (lang) => {
    // El pie es el NAP visible: tiene que coincidir carácter a carácter con la
    // ficha de Google, así que lo mínimo es que sea idéntico a la fuente.
    expect(translations[lang].footer.address).toBe(BUSINESS.address.street);
  });

  it.each(idiomas)("no queda rastro de la dirección antigua en %s", (lang) => {
    const todo = JSON.stringify(translations[lang]);

    // Las dos redacciones que llegaron a producción: con coma en el pie y sin
    // coma en el FAQ.
    expect(todo).not.toContain("Galicia 25");
    expect(todo).not.toContain("Galicia, 25");
  });

  it.each(idiomas)("las respuestas del FAQ de %s citan la plaza", (lang) => {
    const items = translations[lang].faq.items;

    // Por la pregunta, no por el índice: reordenar el FAQ no debe romper esto.
    const donde = items.find((f) => /comer carne/i.test(f.q));
    const mejor = items.find((f) => /asador/i.test(f.q));

    expect(donde, "no existe la pregunta de dónde comer").toBeDefined();
    expect(mejor, "no existe la pregunta del mejor asador").toBeDefined();

    expect(donde!.a).toContain("Marqués de Monroy");
    expect(mejor!.a).toContain("Marqués de Monroy");
  });
});
