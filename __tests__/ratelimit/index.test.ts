import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, rateLimitKey } from "@/lib/ratelimit";

const supabaseMock = {
  rpc: vi.fn(),
};

describe("checkRateLimit", () => {
  beforeEach(() => {
    supabaseMock.rpc.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna true cuando el RPC permite la operación (data: true)", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: true, error: null });

    const allowed = await checkRateLimit(supabaseMock as any, "reservation:1.2.3.4", {
      max: 5,
      windowSeconds: 60,
    });

    expect(allowed).toBe(true);
  });

  it("llama al RPC check_rate_limit con los params p_-prefixed", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: true, error: null });

    await checkRateLimit(supabaseMock as any, "upload:admin", {
      max: 10,
      windowSeconds: 60,
    });

    expect(supabaseMock.rpc).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "upload:admin",
      p_max: 10,
      p_window_seconds: 60,
    });
  });

  it("retorna false cuando el límite está excedido (data: false)", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: false, error: null });

    const allowed = await checkRateLimit(supabaseMock as any, "reservation:1.2.3.4", {
      max: 5,
      windowSeconds: 60,
    });

    expect(allowed).toBe(false);
  });

  it("fail-open: retorna true y loguea console.error cuando el RPC devuelve error (función ausente)", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    supabaseMock.rpc.mockResolvedValue({
      data: null,
      error: {
        message:
          "Could not find the function public.check_rate_limit(p_key, p_max, p_window_seconds) in the schema cache",
      },
    });

    const allowed = await checkRateLimit(supabaseMock as any, "reservation:1.2.3.4", {
      max: 5,
      windowSeconds: 60,
    });

    expect(allowed).toBe(true);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("fail-open: retorna true y loguea console.error si el RPC lanza una excepción (fallo de red)", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    supabaseMock.rpc.mockRejectedValue(new Error("network down"));

    const allowed = await checkRateLimit(supabaseMock as any, "reservation:1.2.3.4", {
      max: 5,
      windowSeconds: 60,
    });

    expect(allowed).toBe(true);
    expect(errorSpy).toHaveBeenCalled();
  });

  describe("fallback en memoria (camino degradado, best-effort por instancia)", () => {
    it("cuando el RPC devuelve error, el bucket local permite hasta max y deniega después", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      supabaseMock.rpc.mockResolvedValue({
        data: null,
        error: { message: "Could not find the function public.check_rate_limit" },
      });

      const key = "reservation:9.9.9.9-rpc-error";
      const opts = { max: 3, windowSeconds: 60 };

      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it("cuando el RPC lanza una excepción, el bucket local también limita tras max", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      supabaseMock.rpc.mockRejectedValue(new Error("network down"));

      const key = "reservation:9.9.9.10-rpc-throw";
      const opts = { max: 2, windowSeconds: 60 };

      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(false);
    });

    it("inMemoryFallback: false desactiva el bucket local (fail-open puro)", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      supabaseMock.rpc.mockResolvedValue({
        data: null,
        error: { message: "missing function" },
      });

      const key = "upload:admin-pure-fail-open";
      const opts = { max: 1, windowSeconds: 60, inMemoryFallback: false };

      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
    });

    it("el bucket local expira tras la ventana y vuelve a permitir", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.useFakeTimers();
      try {
        supabaseMock.rpc.mockRejectedValue(new Error("still down"));

        const key = "reservation:9.9.9.11-window-reset";
        const opts = { max: 1, windowSeconds: 60 };

        expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
        expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(false);

        vi.advanceTimersByTime(61_000);

        expect(await checkRateLimit(supabaseMock as any, key, opts)).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

describe("rateLimitKey", () => {
  it("con IP de plataforma genera la clave estable prefix:ip", () => {
    expect(rateLimitKey("reservation", "1.2.3.4")).toBe("reservation:1.2.3.4");
  });

  it("sin IP genera una clave efímera única por request — nunca un literal compartido", () => {
    const a = rateLimitKey("reservation", undefined);
    const b = rateLimitKey("reservation", undefined);

    expect(a).toMatch(/^reservation:anon:/);
    expect(b).toMatch(/^reservation:anon:/);
    expect(a).not.toBe(b);
    expect(a).not.toContain("127.0.0.1");
  });
});
