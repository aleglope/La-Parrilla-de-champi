import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/reservations/availability/closed-days
 *
 * Returns list of closed dates with their closure reasons
 * Public endpoint - no authentication required
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: settings, error } = await supabase
      .from("availability_settings")
      .select("date, notes")
      .eq("is_open", false)
      .gte("date", new Date().toISOString().split("T")[0]) // Only future/today dates
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching closed days:", error);
      return NextResponse.json(
        { error: "Failed to fetch closed days" },
        { status: 500 }
      );
    }

    const closedDays = (settings || []).map((s) => s.date);

    // Create a map of date to closure reason
    const closedDaysReasons: Record<string, string> = {};
    (settings || []).forEach((s) => {
      if (s.notes) {
        closedDaysReasons[s.date] = s.notes;
      }
    });

    return NextResponse.json({ closedDays, closedDaysReasons });
  } catch (error) {
    console.error("Unexpected error fetching closed days:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
