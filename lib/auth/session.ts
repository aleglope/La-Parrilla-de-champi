import { SignJWT, jwtVerify } from "jose";

const SESSION_DURATION = "7d"; // mismo horizonte que el maxAge de la cookie (7 días)

/**
 * Lee el secreto de firma de la sesión admin desde el entorno.
 * Lanza si ADMIN_JWT_SECRET no está definido: la app debe fallar
 * explícitamente en vez de operar con un secreto vacío.
 */
export function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set");
  }
  return secret;
}

/**
 * Firma un JWT HS256 de sesión admin con expiración a 7 días.
 * El secreto se lee por-llamada (no a nivel de módulo) para que
 * `next build` no requiera la env var y el throw sea en runtime.
 */
export async function signSession(): Promise<string> {
  const secret = new TextEncoder().encode(getJwtSecret());
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secret);
}

/**
 * Verifica el JWT de la cookie admin-session.
 * Devuelve false si el token está ausente, manipulado, expirado o
 * es un valor legacy no-JWT (p. ej. la antigua cookie "true").
 */
export async function verifySession(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
