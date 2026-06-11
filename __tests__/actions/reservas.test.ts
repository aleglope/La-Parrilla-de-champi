import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/reservations/create/route";
import type { Reservation } from "@/lib/types/reservations";

vi.mock("@/lib/email/EmailService", () => ({
  sendReservationConfirmation: vi.fn().mockResolvedValue(undefined),
  sendAdminNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const supabaseMock = {
  rpc: vi.fn(),
  from: vi.fn(),
};

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createRouteHandlerClient: () => supabaseMock,
}));

function makeRequest(body: any) {
  return {
    json: async () => body,
    // El gate de rate limit (SEC-04) lee la IP de plataforma (x-real-ip vía
    // ipAddress de @vercel/functions); null → IP indefinida → clave efímera.
    headers: { get: () => null },
  } as any;
}

describe("POST /api/reservations/create", () => {
  beforeEach(() => {
    supabaseMock.rpc.mockReset();
    supabaseMock.from.mockReset();
  });

  afterEach(() => {
    delete (process.env as any).RESEND_API_KEY;
  });

  it("retorna 400 si faltan campos obligatorios", async () => {
    const req = makeRequest({
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      reservationDate: "",
      timeSlot: "",
      guestsCount: 0,
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it("retorna 409 cuando no hay disponibilidad", async () => {
    const body = {
      guestName: "Juan Pérez",
      guestEmail: "juan@example.com",
      guestPhone: "+34 600 000 000",
      reservationDate: "2025-01-10",
      timeSlot: "20:00",
      guestsCount: 4,
    };

    supabaseMock.rpc.mockResolvedValue({
      data: [
        {
          available: false,
          currentBookings: 10,
          maxCapacity: 10,
          remainingCapacity: 0,
        },
      ],
      error: null,
    });

    const req = makeRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      "check_reservation_availability",
      {
        p_date: body.reservationDate,
        p_time: body.timeSlot,
        p_guests: body.guestsCount,
      }
    );
    expect(res.status).toBe(409);
    expect(json.error).toBeDefined();
  });

  it("crea la reserva, normaliza hora y envía emails", async () => {
    (process.env as any).RESEND_API_KEY = "test_key";

    const body = {
      guestName: "María López",
      guestEmail: "maria@example.com",
      guestPhone: "+34 600 000 001",
      reservationDate: "2025-02-15",
      timeSlot: "18:30:00",
      guestsCount: 2,
      specialRequests: "Ventana",
    };

    supabaseMock.rpc.mockResolvedValue({
      data: [
        {
          available: true,
          currentBookings: 0,
          maxCapacity: 20,
          remainingCapacity: 20,
        },
      ],
      error: null,
    });

    const builder = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "abc123",
          guest_name: body.guestName,
          guest_email: body.guestEmail,
          guest_phone: body.guestPhone,
          reservation_date: body.reservationDate,
          time_slot: "18:30",
          guests_count: body.guestsCount,
          special_requests: body.specialRequests,
          source: "web",
          status: "pending",
          created_at: "2025-02-01T10:00:00Z",
          updated_at: "2025-02-01T10:00:00Z",
        },
        error: null,
      }),
    };
    supabaseMock.from.mockReturnValue(builder as any);

    const req = makeRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    const reservation = json.reservation as Reservation;
    expect(reservation.timeSlot).toBe("18:30");
    expect(builder.insert).toHaveBeenCalledWith({
      guest_name: body.guestName,
      guest_email: body.guestEmail,
      guest_phone: body.guestPhone,
      reservation_date: body.reservationDate,
      time_slot: "18:30",
      guests_count: body.guestsCount,
      special_requests: body.specialRequests,
      source: "web",
      status: "pending",
    });
  });
});
