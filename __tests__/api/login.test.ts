import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cookies } from "next/headers";
import { POST } from "@/app/api/admin/login/route";
import { signSession } from "@/lib/auth/session";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  signSession: vi.fn().mockResolvedValue("signed.jwt.token"),
}));

const cookieStoreMock = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

function makeRequest(body: any) {
  return { json: async () => body } as any;
}

const TEST_EMAIL = "admin-test@example.com";
const TEST_PASSWORD = "test-password-not-real";

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReturnValue(cookieStoreMock as any);
    cookieStoreMock.set.mockReset();
    vi.mocked(signSession).mockClear();
    process.env.ADMIN_EMAIL = TEST_EMAIL;
    process.env.ADMIN_PASSWORD = TEST_PASSWORD;
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
  });

  it("sin ADMIN_EMAIL/ADMIN_PASSWORD retorna 500 y nunca acepta los antiguos defaults", async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;

    const res = await POST(
      makeRequest({ email: "admin@laparrilla.com", password: "admin123" })
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeDefined();
    expect(cookieStoreMock.set).not.toHaveBeenCalled();
  });

  it("con credenciales válidas firma la sesión y setea la cookie admin-session", async () => {
    const res = await POST(
      makeRequest({ email: TEST_EMAIL, password: TEST_PASSWORD })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(signSession).toHaveBeenCalledTimes(1);
    expect(cookieStoreMock.set).toHaveBeenCalledWith(
      "admin-session",
      "signed.jwt.token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })
    );
  });

  it("con credenciales incorrectas retorna 401 sin setear cookie", async () => {
    const res = await POST(
      makeRequest({ email: TEST_EMAIL, password: "wrong-password" })
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBeDefined();
    expect(cookieStoreMock.set).not.toHaveBeenCalled();
  });
});
