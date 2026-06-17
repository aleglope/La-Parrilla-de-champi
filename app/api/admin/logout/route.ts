import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * API Route para logout del admin
 */
export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete("admin-session");
    cookieStore.delete("admin-auth"); // limpieza de la cookie legacy

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
