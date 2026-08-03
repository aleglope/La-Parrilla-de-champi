import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { ipAddress } from "@vercel/functions";
import { signSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * Comparación de tiempo constante (mismo patrón que /api/revalidate).
 * Guard de longitud previo: timingSafeEqual lanza con buffers de distinto
 * tamaño, así que si difieren se rechaza sin comparar.
 */
function safeEqual(provided: unknown, expected: string): boolean {
  if (typeof provided !== "string") {
    return false;
  }
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * API Route para login del admin
 * Autenticación con variables de entorno y sesión JWT firmada.
 *
 * Rate limiting en dos niveles: por IP y global. El bucket global existe
 * porque hay una sola identidad admin y el email es público (aparece como
 * destinatario de las notificaciones), así que al atacante solo le queda
 * adivinar la contraseña; un límite que dependiera solo de la IP se evade
 * rotándola.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const ip = ipAddress(request);

    // Límite por IP: los intentos de un usuario legítimo caben de sobra
    if (
      !(await checkRateLimit(supabase, rateLimitKey("login", ip), {
        max: 5,
        windowSeconds: 900,
      }))
    ) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera unos minutos." },
        { status: 429 }
      );
    }

    // Límite global: techo para toda la cuenta, resistente a rotación de IP
    if (
      !(await checkRateLimit(supabase, "login:global", {
        max: 30,
        windowSeconds: 3600,
      }))
    ) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera unos minutos." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    // Credenciales desde variables de entorno (sin fallbacks)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Auth no configurada" },
        { status: 500 }
      );
    }

    // Se evalúan siempre ambas comparaciones (sin cortocircuito) para no
    // revelar por tiempo si lo que falló fue el email o la contraseña.
    const emailOk = safeEqual(email, ADMIN_EMAIL);
    const passwordOk = safeEqual(password, ADMIN_PASSWORD);

    if (emailOk && passwordOk) {
      // Firmar sesión y establecer cookie de autenticación
      const token = await signSession();
      const cookieStore = cookies();
      cookieStore.set("admin-session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
