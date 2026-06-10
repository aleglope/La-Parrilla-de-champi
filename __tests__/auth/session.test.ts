// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SignJWT } from "jose";
import { getJwtSecret, signSession, verifySession } from "@/lib/auth/session";

const TEST_SECRET = "test-secret-not-real-32-chars-xx";

describe("lib/auth/session", () => {
  beforeEach(() => {
    process.env.ADMIN_JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_JWT_SECRET;
  });

  it("sign+verify: un token firmado con signSession verifica a true", async () => {
    const token = await signSession();
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
    await expect(verifySession(token)).resolves.toBe(true);
  });

  it("tamper: un token con el payload mutado verifica a false", async () => {
    const token = await signSession();
    const [header, payload, signature] = token.split(".");
    const mutated =
      (payload[0] === "A" ? "B" : "A") + payload.slice(1);
    const tampered = [header, mutated, signature].join(".");
    expect(tampered).not.toBe(token);
    await expect(verifySession(tampered)).resolves.toBe(false);
  });

  it("expiry: un token con exp en el pasado verifica a false", async () => {
    const secret = new TextEncoder().encode(TEST_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const expired = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now - 7200)
      .setExpirationTime(now - 3600)
      .sign(secret);
    await expect(verifySession(expired)).resolves.toBe(false);
  });

  it("legacy: la cookie vieja 'true' y el token ausente verifican a false", async () => {
    await expect(verifySession("true")).resolves.toBe(false);
    await expect(verifySession(undefined)).resolves.toBe(false);
  });

  it("getJwtSecret lanza si ADMIN_JWT_SECRET no está definido", () => {
    delete process.env.ADMIN_JWT_SECRET;
    expect(() => getJwtSecret()).toThrow("ADMIN_JWT_SECRET is not set");
  });
});
