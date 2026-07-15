import { describe, it, expect } from "vitest";
import {
  isFeriaActiva,
  MEDIEVAL_DISHES,
  FERIA_TEXTS,
  formatPrice,
  generateMedievalMenuSchema,
} from "@/lib/event/feria-medieval";

describe("lib/event/feria-medieval", () => {
  describe("isFeriaActiva — bordes de la ventana UTC", () => {
    it("devuelve false justo antes del inicio (2026-07-17T14:59:59Z)", () => {
      expect(isFeriaActiva(new Date("2026-07-17T14:59:59Z"))).toBe(false);
    });

    it("devuelve true en el primer instante (2026-07-17T15:00:00Z, inclusive)", () => {
      expect(isFeriaActiva(new Date("2026-07-17T15:00:00Z"))).toBe(true);
    });

    it("devuelve true dentro de la ventana (2026-07-18T12:00:00Z)", () => {
      expect(isFeriaActiva(new Date("2026-07-18T12:00:00Z"))).toBe(true);
    });

    it("devuelve true en el último instante dentro (2026-07-19T21:59:59Z)", () => {
      expect(isFeriaActiva(new Date("2026-07-19T21:59:59Z"))).toBe(true);
    });

    it("devuelve false en el instante final (2026-07-19T22:00:00Z, exclusivo)", () => {
      expect(isFeriaActiva(new Date("2026-07-19T22:00:00Z"))).toBe(false);
    });

    it("devuelve false después de la ventana (2026-07-20T10:00:00Z)", () => {
      expect(isFeriaActiva(new Date("2026-07-20T10:00:00Z"))).toBe(false);
    });
  });

  describe("MEDIEVAL_DISHES — integridad de datos", () => {
    it("contiene exactamente 8 platos", () => {
      expect(MEDIEVAL_DISHES).toHaveLength(8);
    });

    it("cada plato tiene textos es/gl no vacíos y precio > 0", () => {
      for (const dish of MEDIEVAL_DISHES) {
        expect(dish.id.length).toBeGreaterThan(0);
        expect(dish.name.length).toBeGreaterThan(0);
        expect(dish.name_gl.length).toBeGreaterThan(0);
        expect(dish.description.length).toBeGreaterThan(0);
        expect(dish.description_gl.length).toBeGreaterThan(0);
        expect(dish.price).toBeGreaterThan(0);
      }
    });

    it("los ids de los platos son únicos", () => {
      const ids = MEDIEVAL_DISHES.map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("formatPrice", () => {
    it("formatea con coma decimal y símbolo de euro", () => {
      expect(formatPrice(25)).toBe("25,00 €");
      expect(formatPrice(3.5)).toBe("3,50 €");
    });
  });

  describe("FERIA_TEXTS", () => {
    it("expone textos completos para es y gl", () => {
      for (const lang of ["es", "gl"] as const) {
        const t = FERIA_TEXTS[lang];
        expect(t.eventName.length).toBeGreaterThan(0);
        expect(t.dates.length).toBeGreaterThan(0);
        expect(t.menuHeading.length).toBeGreaterThan(0);
        expect(t.menuSubtitle.length).toBeGreaterThan(0);
        expect(t.ctaLabel.length).toBeGreaterThan(0);
        expect(t.metaTitle.length).toBeGreaterThan(0);
        expect(t.metaDescription.length).toBeGreaterThan(0);
      }
    });
  });

  describe("generateMedievalMenuSchema", () => {
    it('devuelve "@type": "Menu" con 8 MenuItem y offers en EUR', () => {
      const schema = generateMedievalMenuSchema("es") as any;
      expect(schema["@type"]).toBe("Menu");
      const sections = Array.isArray(schema.hasMenuSection)
        ? schema.hasMenuSection
        : [schema.hasMenuSection];
      const items = sections.flatMap((s: any) =>
        Array.isArray(s.hasMenuItem) ? s.hasMenuItem : [s.hasMenuItem]
      );
      expect(items).toHaveLength(8);
      for (const item of items) {
        expect(item["@type"]).toBe("MenuItem");
        expect(item.offers.priceCurrency).toBe("EUR");
      }
    });

    it("usa los nombres gallegos cuando lang es gl", () => {
      const schema = generateMedievalMenuSchema("gl") as any;
      const sections = Array.isArray(schema.hasMenuSection)
        ? schema.hasMenuSection
        : [schema.hasMenuSection];
      const items = sections.flatMap((s: any) =>
        Array.isArray(s.hasMenuItem) ? s.hasMenuItem : [s.hasMenuItem]
      );
      const names = items.map((i: any) => i.name);
      expect(names).toContain("Polbo á feira");
      expect(names).toContain("Churrasco de tenreira");
    });
  });
});
