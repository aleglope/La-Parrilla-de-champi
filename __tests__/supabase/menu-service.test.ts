import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCategories,
  getCategoryById,
  getDishes,
  getDishesByCategory,
  getDishById,
  createCategory,
  updateCategory,
  deleteCategory,
  createDish,
  updateDish,
  deleteDish,
  toggleDishAvailability,
} from "@/lib/supabase/menu-service";

// Estrategia bimodal de menu-service (ARCH-02):
// - Lectura (Server Components, menu ISR + admin SSR) -> createPublicReadClient
//   (cookie-less; preserva la generacion estatica de /[lang]/menu).
// - CRUD (Client Components DishesManager/CategoriesManager) -> getSupabase
//   (browser client; un server client romperia su bundle 'use client').
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

const crudFns: Array<[string, () => Promise<unknown>]> = [
  ["createCategory", () => createCategory("Tapas")],
  ["updateCategory", () => updateCategory("cat-1", "Tapas", "Petiscos", 1)],
  ["deleteCategory", () => deleteCategory("cat-1")],
  ["createDish", () => createDish({ name: "Churrasco" })],
  ["updateDish", () => updateDish("dish-1", { name: "Churrasco" })],
  ["deleteDish", () => deleteDish("dish-1")],
  ["toggleDishAvailability", () => toggleDishAvailability("dish-1", true)],
];

describe("menu-service — seleccion bimodal de cliente Supabase", () => {
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

  describe("funciones CRUD (Client Components admin)", () => {
    it.each(crudFns)(
      "%s sigue usando getSupabase (browser client)",
      async (_name, call) => {
        await call();
        expect(getSupabaseMock).toHaveBeenCalledTimes(1);
        expect(createPublicReadClientMock).not.toHaveBeenCalled();
      }
    );
  });
});
