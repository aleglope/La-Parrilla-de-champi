import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/availability
 *
 * Query params:
 * - startDate: YYYY-MM-DD format (optional)
 * - endDate: YYYY-MM-DD format (optional)
 *
 * Get availability settings for a date range
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication using admin-auth cookie
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get("admin-auth")?.value === "true";

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("availability_settings")
      .select("*")
      .order("date", { ascending: true });

    if (startDate) {
      query = query.gte("date", startDate);
    }

    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error("Error fetching availability settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch availability settings" },
        { status: 500 }
      );
    }

    // Convert to camelCase
    const formattedSettings = (settings || []).map((s) => ({
      id: s.id,
      date: s.date,
      isOpen: s.is_open,
      maxCapacity: s.max_capacity,
      notes: s.notes,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    return NextResponse.json({ settings: formattedSettings });
  } catch (error) {
    console.error("Unexpected error fetching availability settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/availability
 *
 * Create or update availability settings for a specific date
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication using admin-auth cookie
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get("admin-auth")?.value === "true";

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    const { date, isOpen, maxCapacity, notes } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Upsert the availability setting
    const { data: setting, error } = await supabase
      .from("availability_settings")
      .upsert(
        {
          date,
          is_open: isOpen === undefined ? true : isOpen,
          max_capacity: maxCapacity || null,
          notes: notes || null,
        },
        {
          onConflict: "date",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting availability setting:", error);
      return NextResponse.json(
        { error: "Failed to update availability setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      setting: {
        id: setting.id,
        date: setting.date,
        isOpen: setting.is_open,
        maxCapacity: setting.max_capacity,
        notes: setting.notes,
        createdAt: setting.created_at,
        updatedAt: setting.updated_at,
      },
      message: "Availability setting updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error updating availability setting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/availability
 *
 * Query params:
 * - date: YYYY-MM-DD format (required)
 *
 * Delete availability setting for a specific date (reverts to default)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication using admin-auth cookie
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get("admin-auth")?.value === "true";

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("availability_settings")
      .delete()
      .eq("date", date);

    if (error) {
      console.error("Error deleting availability setting:", error);
      return NextResponse.json(
        { error: "Failed to delete availability setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Availability setting deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error deleting availability setting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
