import type { ErrorEvent, EventHint } from "@sentry/nextjs";

/**
 * Campos del dominio de reservas que nunca deben salir hacia Sentry.
 * Cubre las variantes snake_case (DB/API) y camelCase (formularios).
 */
const PII_FIELDS = [
  "email",
  "phone",
  "guest_email",
  "guest_phone",
  "guest_name",
  "name",
  "special_requests",
  "specialRequests",
];

/**
 * beforeSend compartido por los tres inits de Sentry (client/server/edge).
 * Elimina PII del evento antes de enviarlo a Sentry SaaS: datos de usuario,
 * campos sensibles del body de la request, cookies y query string.
 * Devuelve siempre el evento (scrubbed) — nunca lo descarta.
 */
export function scrubPii(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
  // 1. Datos de usuario adjuntados por el SDK o por código propio
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete (event.user as Record<string, unknown>).username;
  }

  // 2. Body de la request capturado por la RequestData integration
  if (event.request?.data && typeof event.request.data === "object") {
    for (const field of PII_FIELDS) {
      delete (event.request.data as Record<string, unknown>)[field];
    }
  } else if (event.request && typeof event.request.data === "string") {
    // Defensivo: un body string (JSON sin parsear) podría contener PII — vaciarlo
    event.request.data = undefined;
  }

  // 3. Cookies y query string (pueden filtrar tokens o identificadores)
  if (event.request) {
    delete event.request.cookies;
    delete event.request.query_string;
  }

  return event;
}
