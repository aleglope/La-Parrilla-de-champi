import { describe, it, expect } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import { scrubPii } from "@/lib/observability/scrubPii";

const HINT = {} as Parameters<typeof scrubPii>[1];

describe("lib/observability/scrubPii", () => {
  it("user: elimina email, ip_address y username del evento", () => {
    const event = {
      user: {
        email: "guest@example.com",
        ip_address: "203.0.113.7",
        username: "champi-guest",
        id: "anon-123",
      },
    } as ErrorEvent;

    const result = scrubPii(event, HINT);

    expect(result).not.toBeNull();
    expect(result?.user).not.toHaveProperty("email");
    expect(result?.user).not.toHaveProperty("ip_address");
    expect(result?.user).not.toHaveProperty("username");
  });

  it("request.data: elimina los campos PII de reservas del body", () => {
    const event = {
      request: {
        data: {
          guest_email: "guest@example.com",
          guest_phone: "+34600000000",
          guest_name: "Nombre Apellido",
          special_requests: "mesa junto a la ventana",
          guests_count: 4,
        },
      },
    } as unknown as ErrorEvent;

    const result = scrubPii(event, HINT);
    const data = result?.request?.data as Record<string, unknown>;

    expect(data).not.toHaveProperty("guest_email");
    expect(data).not.toHaveProperty("guest_phone");
    expect(data).not.toHaveProperty("guest_name");
    expect(data).not.toHaveProperty("special_requests");
    // Los campos no sensibles se conservan
    expect(data.guests_count).toBe(4);
  });

  it("request.data string (JSON sin parsear): se vacía por completo", () => {
    const event = {
      request: {
        data: '{"guest_email":"guest@example.com"}',
      },
    } as unknown as ErrorEvent;

    const result = scrubPii(event, HINT);

    expect(result?.request?.data).toBeUndefined();
  });

  it("request: elimina cookies y query_string", () => {
    const event = {
      request: {
        cookies: { "admin-session": "token" },
        query_string: "email=guest@example.com",
        url: "https://example.com/api/reservations",
      },
    } as unknown as ErrorEvent;

    const result = scrubPii(event, HINT);

    expect(result?.request).not.toHaveProperty("cookies");
    expect(result?.request).not.toHaveProperty("query_string");
    // La URL no es PII en este dominio: se conserva
    expect(result?.request?.url).toBe("https://example.com/api/reservations");
  });

  it("devuelve el mismo evento (no null): el evento se envía scrubbed, no se descarta", () => {
    const event = {
      user: { email: "guest@example.com" },
      request: { data: { guest_phone: "+34600000000" } },
    } as unknown as ErrorEvent;

    const result = scrubPii(event, HINT);

    expect(result).toBe(event);
  });

  it("evento sin user ni request: no lanza y devuelve el evento intacto", () => {
    const event = { message: "boom" } as ErrorEvent;

    expect(() => scrubPii(event, HINT)).not.toThrow();
    expect(scrubPii(event, HINT)).toBe(event);
  });
});
