import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCategories,
  getCategoryById,
  getDishes,
  getDishesByCategory,
  getDishById,
} from "@/lib/supabase/menu-service";

// menu-service quedó como módulo de SOLO LECTURA (SEC-05).
//
// Las lecturas (Server Components, menu ISR + admin SSR) usan
// createPublicReadClient (cookie-less; preserva la generación estática de
// /[lang]/menu).
//
// El CRUD ya no vive aquí: escribía desde el navegador con la clave anónima,
// que es pública, y obligaba a mantener políticas RLS de escritura abiertas a
// `anon`. Se movió a Server Actions autenticadas (app/actions/menuAdmin.ts).
// Su cobertura está en __tests__/actions/menuAdmin.test.ts.
const { createPublicReadClientMock, getSupabaseMock } = vi.hoisted(() => {
  function makeChainableClient() {
    const chain: Record<string, unknown> = {};
    for (const method of [
      "from",
      "select",
      "order",
      "eq",
      "single",
      "insert",
      "update",
      "delete",
    ]) {
      chain[method] = vi.fn(() => chain);
    }
    // Thenable: los query builders de supabase-js se await-ean directamente.
    chain.then = (resolve: (value: unknown) => unknown) =>
      resolve({ data: null, error: null });
    return chain;
  }

  return {
    createPublicReadClientMock: vi.fn(() => makeChainableClient()),
    getSupabaseMock: vi.fn(() => makeChainableClient()),
  };
});

vi.mock("@/lib/supabase/public-read", () => ({
  createPublicReadClient: createPublicReadClientMock,
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: getSupabaseMock,
}));

const readFns: Array<[string, () => Promise<unknown>]> = [
  ["getCategories", () => getCategories()],
  ["getCategoryById", () => getCategoryById("cat-1")],
  ["getDishes", () => getDishes()],
  ["getDishesByCategory", () => getDishesByCategory("cat-1")],
  ["getDishById", () => getDishById("dish-1")],
];

describe("menu-service — cliente Supabase", () => {
  beforeEach(() => {
    createPublicReadClientMock.mockClear();
    getSupabaseMock.mockClear();
  });

  describe("funciones de lectura (Server Components, ISR)", () => {
    it.each(readFns)(
      "%s usa createPublicReadClient (cookie-less), no el browser client",
      async (_name, call) => {
        await call();
        expect(createPublicReadClientMock).toHaveBeenCalledTimes(1);
        expect(getSupabaseMock).not.toHaveBeenCalled();
      }
    );
  });

  describe("el módulo no reintroduce escritura desde el navegador", () => {
    it("no exporta ninguna función de mutación", async () => {
      const mod = await import("@/lib/supabase/menu-service");
      const prohibidas = [
        "createCategory",
        "updateCategory",
        "deleteCategory",
        "createDish",
        "updateDish",
        "deleteDish",
        "toggleDishAvailability",
      ];

      for (const nombre of prohibidas) {
        expect(
          mod[nombre as keyof typeof mod],
          `menu-service volvió a exportar ${nombre}: escribiría con la clave anónima, que es pública`
        ).toBeUndefined();
      }
    });

    it("ninguna lectura instancia el browser client", async () => {
      for (const [, call] of readFns) {
        await call();
      }
      expect(getSupabaseMock).not.toHaveBeenCalled();
    });
  });
});
