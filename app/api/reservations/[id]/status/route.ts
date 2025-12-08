import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { UpdateReservationStatusDto } from "@/lib/types/reservations";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/reservations/[id]/status
 *
 * Updates the status of a reservation
 * Requires authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication using admin-auth cookie (same as admin panel)
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("admin-auth")?.value === "true";

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { id } = params;
    const body: UpdateReservationStatusDto = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "no_show",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the reservation
    const { data: reservation, error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating reservation status:", error);
      return NextResponse.json(
        { error: "Failed to update reservation status" },
        { status: 500 }
      );
    }

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // TODO: Send email notification if status is 'confirmed' or 'cancelled'

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        guestName: reservation.guest_name,
        guestEmail: reservation.guest_email,
        guestPhone: reservation.guest_phone,
        reservationDate: reservation.reservation_date,
        timeSlot: reservation.time_slot,
        guestsCount: reservation.guests_count,
        specialRequests: reservation.special_requests,
        source: reservation.source,
        status: reservation.status,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at,
      },
      message: "Reservation status updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error updating reservation status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
