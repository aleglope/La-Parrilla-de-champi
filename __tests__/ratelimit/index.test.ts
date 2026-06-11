import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/ratelimit";

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
});
