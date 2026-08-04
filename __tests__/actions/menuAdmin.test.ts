import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createDish,
  updateDish,
  deleteDish,
  toggleDishAvailability,
} from "@/app/actions/menuAdmin";
import { isAdminRequest } from "@/lib/auth/requireAdmin";

// Las Server Actions del menú sustituyen al CRUD que corría en el navegador
// con la clave anónima. Lo que se prueba aquí es el invariante que sostiene
// el cierre de las políticas RLS (migración 20240101000011): sin sesión admin
// NINGUNA mutación puede llegar a la base de datos.
const { getSupabaseAdminMock, chainSpies } = vi.hoisted(() => {
  const spies = {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  function makeChainableClient() {
    const chain: Record<string, unknown> = {};
    for (const method of ["from", "select", "eq", "single"]) {
      chain[method] = vi.fn(() => chain);
    }
    // Estos tres son los que delatan una escritura real
    chain.insert = vi.fn((...args: unknown[]) => {
      spies.insert(...args);
      return chain;
    });
    chain.update = vi.fn((...args: unknown[]) => {
      spies.update(...args);
      return chain;
    });
    chain.delete = vi.fn((...args: unknown[]) => {
      spies.delete(...args);
      return chain;
    });
    chain.then = (resolve: (value: unknown) => unknown) =>
      resolve({ data: { id: "x" }, error: null });
    return chain;
  }

  return {
    getSupabaseAdminMock: vi.fn(() => makeChainableClient()),
    chainSpies: spies,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

vi.mock("@/lib/auth/requireAdmin", () => ({
  isAdminRequest: vi.fn(),
}));

const mutaciones: Array<[string, () => Promise<unknown>]> = [
  ["createCategory", () => createCategory("Tapas")],
  ["updateCategory", () => updateCategory("cat-1", "Tapas", "Petiscos", 1)],
  ["deleteCategory", () => deleteCategory("cat-1")],
  ["createDish", () => createDish({ name: "Churrasco" })],
  ["updateDish", () => updateDish("dish-1", { name: "Churrasco" })],
  ["deleteDish", () => deleteDish("dish-1")],
  ["toggleDishAvailability", () => toggleDishAvailability("dish-1", true)],
];

describe("Server Actions del menú — gate de sesión admin", () => {
  beforeEach(() => {
    vi.mocked(isAdminRequest).mockReset();
    getSupabaseAdminMock.mockClear();
    chainSpies.insert.mockClear();
    chainSpies.update.mockClear();
    chainSpies.delete.mockClear();
  });

  describe("sin sesión admin", () => {
    it.each(mutaciones)("%s lanza y no toca la base de datos", async (_n, call) => {
      vi.mocked(isAdminRequest).mockResolvedValue(false);

      await expect(call()).rejects.toThrow("No autorizado");

      // El gate corta antes de instanciar el cliente service_role,
      // que es el que saltaría RLS
      expect(getSupabaseAdminMock).not.toHaveBeenCalled();
      expect(chainSpies.insert).not.toHaveBeenCalled();
      expect(chainSpies.update).not.toHaveBeenCalled();
      expect(chainSpies.delete).not.toHaveBeenCalled();
    });
  });

  describe("con sesión admin", () => {
    it.each(mutaciones)("%s ejecuta la mutación", async (_n, call) => {
      vi.mocked(isAdminRequest).mockResolvedValue(true);

      await expect(call()).resolves.not.toThrow();
      expect(getSupabaseAdminMock).toHaveBeenCalled();
    });
  });

  it("propaga el error de la base de datos en vez de tragárselo", async () => {
    vi.mocked(isAdminRequest).mockResolvedValue(true);
    getSupabaseAdminMock.mockImplementationOnce(() => {
      const chain: Record<string, unknown> = {};
      for (const m of ["from", "select", "eq", "single", "insert", "update", "delete"]) {
        chain[m] = vi.fn(() => chain);
      }
      chain.then = (resolve: (value: unknown) => unknown) =>
        resolve({ data: null, error: new Error("violación de constraint") });
      return chain;
    });

    await expect(createDish({ name: "x" })).rejects.toThrow("violación de constraint");
  });
});
