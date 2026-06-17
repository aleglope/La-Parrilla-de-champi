import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/revalidate/route";
import { revalidatePath } from "next/cache";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const DUMMY_SECRET = "dummy-test-secret-not-real";

function makeRequest({
  secret,
  body = {},
}: {
  secret?: string;
  body?: Record<string, unknown>;
}) {
  return {
    headers: {
      get: (key: string) =>
        key.toLowerCase() === "x-revalidate-secret" ? secret ?? null : null,
    },
    json: async () => body,
  } as any;
}

describe("POST /api/revalidate (SEC-03: gate por REVALIDATE_SECRET)", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockReset();
    (process.env as any).REVALIDATE_SECRET = DUMMY_SECRET;
  });

  afterEach(() => {
    delete (process.env as any).REVALIDATE_SECRET;
  });

  it("retorna 401 sin header x-revalidate-secret y NO revalida", async () => {
    const res = await POST(makeRequest({}));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.revalidated).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("retorna 401 con header incorrecto y NO revalida", async () => {
    const res = await POST(makeRequest({ secret: "wrong-secret" }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.revalidated).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("retorna 401 si REVALIDATE_SECRET no está configurado (fail-closed)", async () => {
    delete (process.env as any).REVALIDATE_SECRET;

    const res = await POST(makeRequest({ secret: DUMMY_SECRET }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.revalidated).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("retorna 200 y revalida /menu por defecto con el secreto correcto", async () => {
    const res = await POST(makeRequest({ secret: DUMMY_SECRET }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.revalidated).toBe(true);
    expect(json.path).toBe("/menu");
    expect(revalidatePath).toHaveBeenCalledWith("/menu");
  });

  it("retorna 200 y revalida el path del body con el secreto correcto", async () => {
    const res = await POST(
      makeRequest({ secret: DUMMY_SECRET, body: { path: "/es/menu" } })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.revalidated).toBe(true);
    expect(json.path).toBe("/es/menu");
    expect(revalidatePath).toHaveBeenCalledWith("/es/menu");
  });
});
