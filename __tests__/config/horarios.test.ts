import { describe, it, expect } from "vitest";
import { BUSINESS } from "@/lib/config/business";
import { translations } from "@/lib/i18n/translations";
import { generateRestaurantSchema } from "@/lib/seo/schemas";

/**
 * Los horarios se escriben en prosa en cuatro sitios (pie, FAQ y /llms.txt en
 * dos idiomas) porque tienen que sonar naturales en cada lengua, y eso hace
 * imposible generarlos del todo desde los datos. Lo que sí se puede es
 * comprobar que ninguna de esas copias contradice a la fuente.
 *
 * Existe porque llegaron a divergir de verdad: /reservas anunciaba
 * "Martes a Domingo, 12:00 - 23:30" mientras el resto del sitio decía otra
 * cosa, y estuvo así en producción.
 */
describe("horarios: la prosa no contradice a BUSINESS.hours", () => {
  const { lunch, dinner } = BUSINESS.hours;
  const idiomas = ["es", "gl"] as const;

  it("el schema se deriva de la fuente, no de una copia", () => {
    const schema = generateRestaurantSchema("es");
    const spec = schema.openingHoursSpecification as ReadonlyArray<{
      opens: string;
      closes: string;
      dayOfWeek: readonly string[];
    }>;

    expect(spec).toHaveLength(2);
    expect(spec[0].opens).toBe(lunch.opens);
    expect(spec[0].closes).toBe(lunch.closes);
    expect(spec[0].dayOfWeek).toEqual([...lunch.days]);
    expect(spec[1].opens).toBe(dinner.opens);
    expect(spec[1].closes).toBe(dinner.closes);
    expect(spec[1].dayOfWeek).toEqual([...dinner.days]);
  });

  it.each(idiomas)("el pie de %s usa las horas reales", (lang) => {
    const { hoursLunch, hoursDinner } = translations[lang].footer;

    expect(hoursLunch).toContain(lunch.opens);
    expect(hoursLunch).toContain(lunch.closes);
    expect(hoursDinner).toContain(dinner.opens);
    expect(hoursDinner).toContain(dinner.closes);
  });

  it.each(idiomas)(
    "la respuesta de horarios del FAQ de %s usa las horas reales",
    (lang) => {
      const item = translations[lang].faq.items.find((f) =>
        /horario/i.test(f.q)
      );

      expect(item, "no existe la pregunta de horarios en el FAQ").toBeDefined();

      for (const hora of [
        lunch.opens,
        lunch.closes,
        dinner.opens,
        dinner.closes,
      ]) {
        expect(item!.a).toContain(hora);
      }
    }
  );

  it.each(idiomas)(
    "el FAQ de %s aclara que el sábado no hay comidas y el domingo no hay cenas",
    (lang) => {
      const item = translations[lang].faq.items.find((f) =>
        /horario/i.test(f.q)
      )!;

      // El sábado solo entra en el turno de cena y el domingo solo en el de
      // comida: si la prosa no lo distingue, alguien se planta y se lo encuentra
      // cerrado. Fue exactamente el fallo que hubo que corregir.
      expect(dinner.days).toContain("Saturday");
      expect(lunch.days).not.toContain("Saturday");
      expect(lunch.days).toContain("Sunday");
      expect(dinner.days).not.toContain("Sunday");

      const sabado = lang === "es" ? /sábados/i : /sábados/i;
      const domingo = lang === "es" ? /domingos/i : /domingos/i;
      expect(item.a).toMatch(sabado);
      expect(item.a).toMatch(domingo);
    }
  );

  it("no queda ningún horario inventado en el código de reservas", async () => {
    const fs = await import("node:fs/promises");
    const src = await fs.readFile("app/[lang]/reservas/page.tsx", "utf8");

    // "12:00" no aparece en ningún turno real: si vuelve, es texto inventado.
    expect(src).not.toContain("12:00");
    expect(src).not.toContain("Martes a Domingo");
  });
});
