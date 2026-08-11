import { describe, it, expect } from "vitest";
import { BUSINESS } from "@/lib/config/business";
import { translations } from "@/lib/i18n/translations";
import { generateRestaurantSchema } from "@/lib/seo/schemas";

/**
 * Los horarios se escriben en prosa en varios sitios (pie, FAQ y /llms.txt en
 * dos idiomas) porque tienen que sonar naturales en cada lengua, y eso hace
 * imposible generarlos del todo desde los datos. Lo que sí se puede es
 * comprobar que ninguna de esas copias contradice a la fuente.
 *
 * Existe porque divergieron de verdad, y en grande: la web publicaba durante
 * meses un horario que no coincidía con la ficha de Google en NINGÚN campo
 * (abría a las 13:00 en vez de a las 11:00, cerraba a las 23:30 en vez de a
 * medianoche, decía que el sábado no había comidas y que el domingo no había
 * cenas). La ficha de Google es la fuente, porque la gestiona el restaurante.
 */
describe("horarios: la prosa no contradice a BUSINESS.hours", () => {
  const turnos = [...BUSINESS.hours.regular, ...BUSINESS.hours.verano];
  const horas = [...new Set(turnos.flatMap((t) => [t.opens, t.closes]))];
  const idiomas = ["es", "gl"] as const;

  it("el schema se deriva de la fuente, no de una copia", () => {
    const spec = generateRestaurantSchema("es")
      .openingHoursSpecification as ReadonlyArray<{
      opens: string;
      closes: string;
      dayOfWeek: readonly string[];
    }>;

    expect(spec).toHaveLength(turnos.length);
    turnos.forEach((turno, i) => {
      expect(spec[i].opens).toBe(turno.opens);
      expect(spec[i].closes).toBe(turno.closes);
      expect(spec[i].dayOfWeek).toEqual([...turno.days]);
    });
  });

  it("el lunes no aparece en ningún turno", () => {
    for (const turno of turnos) {
      expect(turno.days).not.toContain("Monday");
    }
    expect(BUSINESS.hours.closed).toContain("Monday");
  });

  it("el sábado tiene comidas y el domingo tiene cenas", () => {
    // Los dos errores concretos que llegaron a producción.
    const conSabado = BUSINESS.hours.regular.filter((t) =>
      t.days.includes("Saturday")
    );
    const conDomingo = BUSINESS.hours.regular.filter((t) =>
      t.days.includes("Sunday")
    );

    expect(conSabado.some((t) => t.opens < "16:00")).toBe(true);
    expect(conDomingo.some((t) => t.opens >= "20:00")).toBe(true);
  });

  it("el martes solo existe dentro del bloque de verano", () => {
    expect(
      BUSINESS.hours.regular.some((t) => t.days.includes("Tuesday"))
    ).toBe(false);
    expect(BUSINESS.hours.verano.every((t) => t.days.includes("Tuesday"))).toBe(
      true
    );
  });

  it.each(idiomas)("el pie de %s usa horas que existen en la fuente", (lang) => {
    const { hoursLunch, hoursDinner } = translations[lang].footer;
    const texto = `${hoursLunch} ${hoursDinner}`;

    for (const encontrada of texto.match(/\d{2}:\d{2}/g) ?? []) {
      expect(horas, `"${encontrada}" no existe en BUSINESS.hours`).toContain(
        encontrada
      );
    }
  });

  it.each(idiomas)(
    "la respuesta de horarios del FAQ de %s solo usa horas de la fuente",
    (lang) => {
      const item = translations[lang].faq.items.find((f) =>
        /horario/i.test(f.q)
      );
      expect(item, "no existe la pregunta de horarios en el FAQ").toBeDefined();

      for (const encontrada of item!.a.match(/\d{2}:\d{2}/g) ?? []) {
        expect(horas, `"${encontrada}" no existe en BUSINESS.hours`).toContain(
          encontrada
        );
      }
      // Debe mencionar que el martes es estacional: es la excepción que más
      // confunde a quien mira el horario por encima.
      expect(item!.a.toLowerCase()).toMatch(/martes/);
    }
  );

  it("no queda ningún horario inventado en el código de reservas", async () => {
    const fs = await import("node:fs/promises");
    const src = await fs.readFile("app/[lang]/reservas/page.tsx", "utf8");

    for (const encontrada of src.match(/\d{2}:\d{2}/g) ?? []) {
      expect(horas, `"${encontrada}" no existe en BUSINESS.hours`).toContain(
        encontrada
      );
    }
  });
});
