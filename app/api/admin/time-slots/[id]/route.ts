import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/time-slots/[id]
 * Updates a time slot's capacity or active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication using the signed admin-session cookie
    const token = cookies().get("admin-session")?.value;

    if (!(await verifySession(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { maxCapacity, isActive } = body;

    // service_role: UPDATE de infra restringido tras el endurecimiento RLS.
    // Gateado por verifySession.
    const supabase = getSupabaseAdmin();

    // Build update object
    const updates: any = {};
    if (maxCapacity !== undefined) {
      // Validate capacity
      if (maxCapacity < 1 || maxCapacity > 200) {
        return NextResponse.json(
          { error: "Capacity must be between 1 and 200" },
          { status: 400 }
        );
      }
      updates.max_capacity = maxCapacity;
    }
    if (isActive !== undefined) {
      updates.is_active = isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("time_slots")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating time slot:", error);
      return NextResponse.json(
        { error: "Failed to update time slot" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      timeSlot: {
        id: data.id,
        time: data.time,
        maxCapacity: data.max_capacity,
        isActive: data.is_active,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
