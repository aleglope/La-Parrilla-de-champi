import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type {
  CreateReservationDto,
  Reservation,
} from "@/lib/types/reservations";
import {
  sendReservationConfirmation,
  sendAdminNotification,
} from "@/lib/email/EmailService";
import { ipAddress } from "@vercel/functions";
import { checkRateLimit, rateLimitKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * POST /api/reservations/create
 * Creates a new reservation (from web or phone)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateReservationDto = await request.json();

    // Validate required fields
    const {
      guestName,
      guestEmail,
      guestPhone,
      reservationDate,
      timeSlot,
      guestsCount,
      specialRequests,
      source = "web",
    } = body;

    if (
      !guestName ||
      !guestEmail ||
      !guestPhone ||
      !reservationDate ||
      !timeSlot ||
      !guestsCount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(reservationDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validate time format (accept both HH:MM and HH:MM:SS from PostgreSQL)
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!timeRegex.test(timeSlot)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:MM or HH:MM:SS" },
        { status: 400 }
      );
    }

    // Normalize time to HH:MM format (remove seconds if present)
    const normalizedTimeSlot = timeSlot.substring(0, 5);

    // Validate guests count
    if (guestsCount < 1 || guestsCount > 20) {
      return NextResponse.json(
        { error: "Guests count must be between 1 and 20" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Rate limit por IP (SEC-04): 5 req/60s sobre store distribuido en Postgres.
    // IP de plataforma vía @vercel/functions (x-real-ip, fijada por Vercel desde
    // la conexión) — el primer valor de x-forwarded-for lo controla el cliente
    // y permitiría evadir el límite con un header falsificado.
    // Sin IP (local/desconocida): rateLimitKey genera una clave efímera, nunca
    // un literal compartido que agrupe a todos los clientes en un mismo bucket.
    const ip = ipAddress(request);

    if (
      !(await checkRateLimit(supabase, rateLimitKey("reservation", ip), {
        max: 5,
        windowSeconds: 60,
      }))
    ) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes" },
        { status: 429 }
      );
    }

    // Check availability using the database function (use normalized time)
    const { data: availabilityCheck, error: availabilityError } =
      await supabase.rpc("check_reservation_availability", {
        p_date: reservationDate,
        p_time: normalizedTimeSlot,
        p_guests: guestsCount,
      });

    if (availabilityError) {
      console.error("Error checking availability:", availabilityError);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    // availabilityCheck is an array with one result
    const availability = availabilityCheck?.[0];

    if (availability?.available !== true) {
      return NextResponse.json(
        {
          error: "No availability for this date and time",
          details: availability,
        },
        { status: 409 } // Conflict
      );
    }

    // Create the reservation (use normalized time)
    const reservationData = {
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      reservation_date: reservationDate,
      time_slot: normalizedTimeSlot,
      guests_count: guestsCount,
      special_requests: specialRequests || null,
      source,
      status: "pending" as const,
    };

    const { data: reservation, error: insertError } = await supabase
      .from("reservations")
      .insert(reservationData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating reservation:", insertError);
      return NextResponse.json(
        { error: "Failed to create reservation" },
        { status: 500 }
      );
    }

    // Send confirmation emails
    if (process.env.RESEND_API_KEY) {
      try {
        // Send to guest
        await sendReservationConfirmation({
          guestName,
          guestEmail,
          reservationDate,
          timeSlot: normalizedTimeSlot,
          guestsCount,
          reservationId: reservation.id,
          specialRequests,
        });

        // Send to admin
        await sendAdminNotification({
          guestName,
          guestEmail,
          reservationDate,
          timeSlot: normalizedTimeSlot,
          guestsCount,
          reservationId: reservation.id,
          specialRequests,
        });
      } catch (emailError) {
        // Log email error but don't fail the reservation
        console.error("Failed to send email notifications:", emailError);
      }
    } else {
      console.warn("Resend API key not configured. Emails not sent.");
    }

    // Convert snake_case to camelCase for response
    const response: Reservation = {
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
    };

    return NextResponse.json(
      {
        success: true,
        reservation: response,
        message: "Reservation created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error creating reservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
