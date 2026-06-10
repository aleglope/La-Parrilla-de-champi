import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Reservation } from "@/lib/types/reservations";
import { verifySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/reservations/list
 *
 * Query params:
 * - date: YYYY-MM-DD format (optional) - specific date
 * - startDate: YYYY-MM-DD format (optional) - range start
 * - endDate: YYYY-MM-DD format (optional) - range end
 * - status: pending|confirmed|cancelled|no_show|completed (optional)
 * - source: web|phone (optional)
 * - limit: number (optional, default 100)
 * - offset: number (optional, default 0)
 *
 * Lists reservations with optional filters
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication using the signed admin-session cookie
    const token = cookies().get("admin-session")?.value;

    if (!(await verifySession(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const limit = Number.parseInt(searchParams.get("limit") || "100");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("reservations")
      .select("*", { count: "exact" })
      .order("reservation_date", { ascending: false })
      .order("time_slot", { ascending: false });

    // Apply filters
    if (date) {
      query = query.eq("reservation_date", date);
    } else if (startDate && endDate) {
      query = query
        .gte("reservation_date", startDate)
        .lte("reservation_date", endDate);
    } else if (startDate) {
      query = query.gte("reservation_date", startDate);
    } else if (endDate) {
      query = query.lte("reservation_date", endDate);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (source) {
      query = query.eq("source", source);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reservations, error, count } = await query;

    if (error) {
      console.error("Error fetching reservations:", error);
      return NextResponse.json(
        { error: "Failed to fetch reservations" },
        { status: 500 }
      );
    }

    // Convert snake_case to camelCase
    const formattedReservations: Reservation[] = (reservations || []).map(
      (r) => ({
        id: r.id,
        guestName: r.guest_name,
        guestEmail: r.guest_email,
        guestPhone: r.guest_phone,
        reservationDate: r.reservation_date,
        timeSlot: r.time_slot,
        guestsCount: r.guests_count,
        specialRequests: r.special_requests,
        source: r.source,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })
    );

    return NextResponse.json({
      reservations: formattedReservations,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Unexpected error fetching reservations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
