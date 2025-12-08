import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
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

    const supabase = createRouteHandlerClient({ cookies });

    // Check if the day is open
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

    // Get existing reservations for this date
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("time_slot, guests_count")
      .eq("reservation_date", date)
      .in("status", ["pending", "confirmed"]);

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError);
      return NextResponse.json(
        { error: "Failed to fetch reservations" },
        { status: 500 }
      );
    }

    // Calculate availability for each time slot
    const dayMaxCapacity = availabilitySetting?.max_capacity;

    const availableTimeSlots = timeSlots.map((slot) => {
      const slotMaxCapacity = dayMaxCapacity
        ? Math.min(slot.max_capacity, dayMaxCapacity)
        : slot.max_capacity;

      // Sum up guests for this time slot
      const bookedGuests =
        reservations
          ?.filter((r) => r.time_slot === slot.time)
          .reduce((sum, r) => sum + r.guests_count, 0) || 0;

      const remainingCapacity = slotMaxCapacity - bookedGuests;

      return {
        time: slot.time,
        available: remainingCapacity > 0,
        remainingCapacity: Math.max(0, remainingCapacity),
      };
    });

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
