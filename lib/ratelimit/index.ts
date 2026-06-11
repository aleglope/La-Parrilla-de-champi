/**
 * Rate limiting distribuido sobre Supabase Postgres (SEC-04)
 * Llama al RPC check_rate_limit (ventana deslizante en la tabla rate_limits),
 * persistente entre instancias serverless — sustituye los Map en memoria.
 */

/**
 * Contrato mínimo del cliente Supabase necesario para el RPC.
 * Lo cumplen tanto createRouteHandlerClient (Route Handlers)
 * como supabaseAdmin (Server Actions) — el caller pasa el suyo
 * para reutilizar la conexión existente.
 */
export interface RateLimitClient {
  rpc(
    fn: "check_rate_limit",
    args: { p_key: string; p_max: number; p_window_seconds: number }
  ): PromiseLike<{ data: unknown; error: { message?: string } | null }>;
}

export interface RateLimitOptions {
  /** Máximo de operaciones permitidas dentro de la ventana */
  max: number;
  /** Tamaño de la ventana deslizante en segundos */
  windowSeconds: number;
}

/**
 * Comprueba si la operación identificada por `key` está dentro del límite.
 *
 * FAIL-OPEN: si el RPC no existe (SQL aún no aplicado) o falla por cualquier
 * motivo, permite la operación y loguea el error — la disponibilidad de
 * reservas prima sobre el rate limiting.
 *
 * @returns true si la operación está permitida; false si excede el límite (caller responde 429)
 */
export async function checkRateLimit(
  supabase: RateLimitClient,
  key: string,
  opts: RateLimitOptions
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max: opts.max,
      p_window_seconds: opts.windowSeconds,
    });

    if (error) {
      // fail-open: nunca bloquear una operación legítima por fallo de infraestructura
      console.error("Rate limit RPC failed (fail-open):", error.message ?? error);
      return true;
    }

    // Cualquier respuesta que no sea false explícito permite la operación
    return data !== false;
  } catch (err) {
    // fail-open también ante excepciones (red caída, cliente mal configurado)
    console.error("Rate limit RPC threw (fail-open):", err);
    return true;
  }
}
