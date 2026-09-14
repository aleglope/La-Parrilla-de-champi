import { describe, it, expect } from "vitest";
import { BUSINESS } from "@/lib/config/business";
import { translations } from "@/lib/i18n/translations";
import { generateRestaurantSchema } from "@/lib/seo/schemas";
import { GET } from "@/app/llms.txt/route";

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
 * cenas). La fuente es el horario que da el dueño: la ficha de Google tiene
 * que ajustarse a él, y no al revés.
 */
describe("horarios: la prosa no contradice a BUSINESS.hours", () => {
  const turnos = [...BUSINESS.hours.regular];
  const horas = [...new Set(turnos.flatMap((t) => [t.opens, t.closes]))];
  const idiomas = ["es", "gl"] as const;
  const hayCenaDomingo = turnos.some(
    (t) => t.days.includes("Sunday") && t.opens >= "20:00"
  );

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

  it("el lunes y el martes no aparecen en ningún turno y figuran como cierre", () => {
    for (const dia of ["Monday", "Tuesday"]) {
      for (const turno of turnos) {
        expect(turno.days).not.toContain(dia);
      }
      expect(BUSINESS.hours.closed).toContain(dia);
    }
  });

  it("el sábado tiene comidas y cenas, y el domingo solo mediodía", () => {
    // El sábado sin comidas fue un error real publicado. La cena del domingo
    // dejó de existir el 2026-09-14, y es fácil que alguien la reponga
    // copiando el horario viejo.
    const conSabado = BUSINESS.hours.regular.filter((t) =>
      t.days.includes("Saturday")
    );
    const conDomingo = BUSINESS.hours.regular.filter((t) =>
      t.days.includes("Sunday")
    );

    expect(conSabado.some((t) => t.opens < "16:00")).toBe(true);
    expect(conSabado.some((t) => t.opens >= "20:00")).toBe(true);
    expect(conDomingo.some((t) => t.opens < "16:00")).toBe(true);
    expect(conDomingo.some((t) => t.opens >= "20:00")).toBe(false);
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

  // La cena del domingo desapareció de los datos y el pie la seguía anunciando:
  // el test de horas no lo detectaba porque 20:00 y 00:00 siguen existiendo.
  // Se compara en los dos sentidos para que siga valiendo si vuelve esa cena.
  it.each(idiomas)(
    "la línea de cenas del pie de %s solo nombra el domingo si hay turno de noche",
    (lang) => {
      expect(/domingo/i.test(translations[lang].footer.hoursDinner)).toBe(
        hayCenaDomingo
      );
    }
  );

  it("/llms.txt solo usa horas de la fuente y su línea de cenas no contradice al domingo", async () => {
    const cuerpo = await GET().text();

    for (const encontrada of cuerpo.match(/\d{2}:\d{2}/g) ?? []) {
      expect(horas, `"${encontrada}" no existe en BUSINESS.hours`).toContain(
        encontrada
      );
    }

    const linea = cuerpo.split("\n").find((l) => l.startsWith("- Cenas:"));
    expect(linea, "no existe la línea de cenas en /llms.txt").toBeDefined();
    expect(/domingo/i.test(linea!)).toBe(hayCenaDomingo);
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
      // Tiene que nombrar los dos días de cierre: son dos seguidos y es lo
      // primero que busca quien mira el horario por encima.
      expect(item!.a.toLowerCase()).toMatch(/\blune?s\b/);
      expect(item!.a.toLowerCase()).toMatch(/\bmartes\b/);
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
