import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { createPublicReadClient } from "@/lib/supabase/public-read";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(() => ({ from: vi.fn() })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("createPublicReadClient", () => {
  beforeEach(() => {
    createClientMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("crea un cliente con la URL pública y la anon key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key-test");

    createPublicReadClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "anon-key-test"
    );
  });

  it("usa fallback '' si faltan las env vars (lectura perezosa, no rompe next build)", () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      createPublicReadClient();
      expect(createClientMock).toHaveBeenCalledWith("", "");
    } finally {
      if (originalUrl !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      }
      if (originalKey !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
      }
    }
  });

  it("es cookie-less y anon-only: no importa next/headers ni usa service-role", () => {
    // Guard de regresión del ISR: si este módulo importase next/headers
    // (cookies()), la ruta /[lang]/menu pasaría de estática/ISR a dinámica.
    const source = readFileSync(
      path.resolve(__dirname, "../../lib/supabase/public-read.ts"),
      "utf8"
    );
    expect(source).not.toContain("next/headers");
    expect(source).not.toMatch(/service_role/i);
  });
});
