import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { DayAvailability } from "@/lib/types/reservations";

export const dynamic = "force-dynamic";

/**
 * GET /api/reservations/availability
 *
 * Query params:
 * - date: YYYY-MM-DD format (required)
 *
 * Returns available time slots for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if the day is open (public SELECT on availability_settings)
    const { data: availabilitySetting } = await supabase
      .from("availability_settings")
      .select("is_open, max_capacity")
      .eq("date", date)
      .single();

    // If there's a specific setting and it's closed, return early
    if (availabilitySetting && !availabilitySetting.is_open) {
      const response: DayAvailability = {
        date,
        isOpen: false,
        timeSlots: [],
      };
      return NextResponse.json(response);
    }

    // Get all active time slots
    const { data: timeSlots, error: timeSlotsError } = await supabase
      .from("time_slots")
      .select("time, max_capacity")
      .eq("is_active", true)
      .order("time");

    if (timeSlotsError) {
      console.error("Error fetching time slots:", timeSlotsError);
      return NextResponse.json(
        { error: "Failed to fetch time slots" },
        { status: 500 }
      );
    }

    if (!timeSlots || timeSlots.length === 0) {
      const response: DayAvailability = {
        date,
        isOpen: true,
        timeSlots: [],
      };
      return NextResponse.json(response);
    }

    // Calculate availability per slot via the check_reservation_availability
    // RPC instead of reading reservations directly: the RPC already applies
    // min(slot.max_capacity, day max_capacity) and the pending/confirmed
    // filter internally, and keeps working when RLS closes the public
    // SELECT on reservations. p_guests=1 probes for at least one free seat.
    const slotChecks = await Promise.all(
      timeSlots.map((slot) =>
        supabase.rpc("check_reservation_availability", {
          p_date: date,
          // time_slots.time may come as HH:MM:SS from Postgres → HH:MM
          p_time: slot.time.substring(0, 5),
          p_guests: 1,
        })
      )
    );

    const availableTimeSlots = [];
    for (let i = 0; i < timeSlots.length; i++) {
      const { data: availabilityCheck, error: rpcError } = slotChecks[i];

      if (rpcError) {
        console.error("Error checking slot availability:", rpcError);
        return NextResponse.json(
          { error: "Failed to fetch reservations" },
          { status: 500 }
        );
      }

      // The RPC returns an array with one row (snake_case fields)
      const remainingCapacity =
        availabilityCheck?.[0]?.remaining_capacity ?? 0;

      availableTimeSlots.push({
        time: timeSlots[i].time,
        available: remainingCapacity > 0,
        remainingCapacity: Math.max(0, remainingCapacity),
      });
    }

    const response: DayAvailability = {
      date,
      isOpen: true,
      timeSlots: availableTimeSlots,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in availability check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
