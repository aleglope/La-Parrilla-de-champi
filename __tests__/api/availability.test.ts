import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/reservations/availability/route";

const supabaseMock = {
  rpc: vi.fn(),
  from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => supabaseMock,
}));

function makeRequest(date?: string) {
  const searchParams = new URLSearchParams();
  if (date) searchParams.set("date", date);
  return {
    nextUrl: { searchParams },
  } as any;
}

/**
 * Builders por tabla: availability_settings (single) y time_slots (order).
 * El conteo de reservas NO debe hacerse con .from("reservations") — debe
 * pasar por el RPC check_reservation_availability (forward-compatible con
 * el endurecimiento RLS que cierra el SELECT público de reservations).
 */
function mockTables({
  setting,
  slots,
}: {
  setting: { is_open: boolean; max_capacity: number | null } | null;
  slots: Array<{ time: string; max_capacity: number }>;
}) {
  supabaseMock.from.mockImplementation((table: string) => {
    if (table === "availability_settings") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: setting, error: null }),
      };
    }
    if (table === "time_slots") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: slots, error: null }),
      };
    }
    throw new Error(`Unexpected table in availability route: ${table}`);
  });
}

describe("GET /api/reservations/availability", () => {
  beforeEach(() => {
    supabaseMock.rpc.mockReset();
    supabaseMock.from.mockReset();
  });

  it("retorna 400 sin parámetro date o con formato inválido", async () => {
    const resMissing = await GET(makeRequest());
    expect(resMissing.status).toBe(400);

    const resBad = await GET(makeRequest("10-01-2025"));
    expect(resBad.status).toBe(400);
  });

  it("día cerrado: retorna isOpen=false sin consultar slots ni RPC", async () => {
    mockTables({
      setting: { is_open: false, max_capacity: null },
      slots: [],
    });

    const res = await GET(makeRequest("2025-03-01"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ date: "2025-03-01", isOpen: false, timeSlots: [] });
    expect(supabaseMock.rpc).not.toHaveBeenCalled();
  });

  it("calcula disponibilidad por slot vía RPC (sin SELECT directo a reservations)", async () => {
    mockTables({
      setting: { is_open: true, max_capacity: 30 },
      slots: [
        { time: "13:00:00", max_capacity: 20 },
        { time: "20:30:00", max_capacity: 20 },
      ],
    });

    supabaseMock.rpc.mockImplementation(
      async (_fn: string, args: { p_time: string }) => {
        if (args.p_time === "13:00") {
          return {
            data: [
              {
                available: true,
                current_bookings: 12,
                max_capacity: 20,
                remaining_capacity: 8,
              },
            ],
            error: null,
          };
        }
        return {
          data: [
            {
              available: false,
              current_bookings: 20,
              max_capacity: 20,
              remaining_capacity: 0,
            },
          ],
          error: null,
        };
      }
    );

    const res = await GET(makeRequest("2025-03-01"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.isOpen).toBe(true);
    expect(json.timeSlots).toEqual([
      { time: "13:00:00", available: true, remainingCapacity: 8 },
      { time: "20:30:00", available: false, remainingCapacity: 0 },
    ]);

    // El conteo viene del RPC, una llamada por slot activo, hora normalizada a HH:MM
    expect(supabaseMock.rpc).toHaveBeenCalledTimes(2);
    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      "check_reservation_availability",
      { p_date: "2025-03-01", p_time: "13:00", p_guests: 1 }
    );
    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      "check_reservation_availability",
      { p_date: "2025-03-01", p_time: "20:30", p_guests: 1 }
    );

    // Nunca se lee reservations directamente (el SELECT anon se cierra en RLS)
    expect(supabaseMock.from).not.toHaveBeenCalledWith("reservations");
  });

  it("sin slots activos: retorna isOpen=true con timeSlots vacío", async () => {
    mockTables({
      setting: { is_open: true, max_capacity: null },
      slots: [],
    });

    const res = await GET(makeRequest("2025-03-02"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ date: "2025-03-02", isOpen: true, timeSlots: [] });
    expect(supabaseMock.rpc).not.toHaveBeenCalled();
  });

  it("error del RPC: retorna 500", async () => {
    mockTables({
      setting: { is_open: true, max_capacity: null },
      slots: [{ time: "13:00:00", max_capacity: 20 }],
    });

    supabaseMock.rpc.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    const res = await GET(makeRequest("2025-03-03"));
    expect(res.status).toBe(500);
  });
});
