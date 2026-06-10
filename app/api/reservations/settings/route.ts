import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";

/**
 * GET /api/reservations/settings
 * Obtiene el estado actual de las reservas (público)
 */
export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("reservation_settings")
      .select("reservations_enabled, notes, updated_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching reservation settings:", error);
      return NextResponse.json(
        { error: "Error al obtener configuración de reservas" },
        { status: 500 }
      );
    }

    // Si no hay configuración, asumir que están activas
    const enabled = data?.reservations_enabled ?? true;

    return NextResponse.json({
      reservationsEnabled: enabled,
      notes: data?.notes,
      updatedAt: data?.updated_at,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/reservations/settings:", error);
    return NextResponse.json(
      { error: "Error inesperado del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reservations/settings
 * Actualiza el estado de las reservas (requiere autenticación admin)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const token = cookies().get("admin-session")?.value;

    if (!(await verifySession(token))) {
      return NextResponse.json(
        { error: "No autorizado. Se requiere autenticación de administrador." },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const body = await request.json();

    const { reservationsEnabled, notes } = body;

    // Validar entrada
    if (typeof reservationsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "El campo 'reservationsEnabled' debe ser un booleano" },
        { status: 400 }
      );
    }

    // Obtener el registro actual (debería haber solo uno)
    const { data: currentSettings, error: fetchError } = await supabase
      .from("reservation_settings")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching current settings:", fetchError);
      return NextResponse.json(
        { error: "Error al obtener configuración actual" },
        { status: 500 }
      );
    }

    let result;

    if (currentSettings) {
      // Actualizar registro existente
      const { data, error } = await supabase
        .from("reservation_settings")
        .update({
          reservations_enabled: reservationsEnabled,
          notes: notes || null,
        })
        .eq("id", currentSettings.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // Crear nuevo registro si no existe
      const { data, error } = await supabase
        .from("reservation_settings")
        .insert({
          reservations_enabled: reservationsEnabled,
          notes: notes || null,
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error("Error updating reservation settings:", result.error);
      return NextResponse.json(
        { error: "Error al actualizar configuración de reservas" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservationsEnabled: result.data.reservations_enabled,
      notes: result.data.notes,
      updatedAt: result.data.updated_at,
    });
  } catch (error) {
    console.error(
      "Unexpected error in PATCH /api/reservations/settings:",
      error
    );
    return NextResponse.json(
      { error: "Error inesperado del servidor" },
      { status: 500 }
    );
  }
}
