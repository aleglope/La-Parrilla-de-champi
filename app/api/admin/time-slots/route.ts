import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/time-slots
 * Returns all time slots with their capacities
 */
export async function GET() {
  try {
    // Check authentication using the signed admin-session cookie
    const token = cookies().get("admin-session")?.value;

    if (!(await verifySession(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { data: timeSlots, error } = await supabase
      .from("time_slots")
      .select("*")
      .order("time", { ascending: true });

    if (error) {
      console.error("Error fetching time slots:", error);
      return NextResponse.json(
        { error: "Failed to fetch time slots" },
        { status: 500 }
      );
    }

    // Convert to camelCase
    const formatted = timeSlots.map((slot) => ({
      id: slot.id,
      time: slot.time,
      maxCapacity: slot.max_capacity,
      isActive: slot.is_active,
    }));

    return NextResponse.json({ timeSlots: formatted });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
