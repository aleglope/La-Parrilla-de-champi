import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signSession } from "@/lib/auth/session";

/**
 * API Route para login del admin
 * Autenticación con variables de entorno y sesión JWT firmada
 */
export async function POST(request: NextRequest) {
  try {
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

    // Verificar credenciales
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
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
