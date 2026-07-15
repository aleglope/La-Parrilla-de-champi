import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// La página importa módulos con efectos a nivel de módulo: se mockean para
// aislar el date-gate (menu-service instancia Supabase; get-dictionary importa
// "server-only"; next/font/google requiere el compilador de Next).
vi.mock("@/lib/supabase/menu-service", () => ({
  getCategories: vi.fn().mockResolvedValue([]),
  getDishes: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/i18n/get-dictionary", () => ({
  getDictionary: vi.fn().mockResolvedValue({
    menu: { title: "Carta", subtitle: "Subtitulo" },
  }),
}));

vi.mock("next/font/google", () => ({
  MedievalSharp: () => ({ className: "font-medieval" }),
}));

import MenuPage from "@/app/[lang]/menu/page";
import { getCategories, getDishes } from "@/lib/supabase/menu-service";

describe("app/[lang]/menu/page — date-gate de la feria", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getCategories).mockClear();
    vi.mocked(getDishes).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dentro de la ventana NO llama a Supabase (getCategories/getDishes)", async () => {
    vi.setSystemTime(new Date("2026-07-18T12:00:00Z"));

    await MenuPage({ params: { lang: "es" } });

    expect(getCategories).not.toHaveBeenCalled();
    expect(getDishes).not.toHaveBeenCalled();
  });

  it("fuera de la ventana SÍ llama a Supabase (camino normal intacto)", async () => {
    vi.setSystemTime(new Date("2026-07-01T12:00:00Z"));

    await MenuPage({ params: { lang: "es" } });

    expect(getCategories).toHaveBeenCalledTimes(1);
    expect(getDishes).toHaveBeenCalledTimes(1);
  });
});
