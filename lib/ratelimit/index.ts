/**
 * Rate limiting distribuido sobre Supabase Postgres (SEC-04)
 * Llama al RPC check_rate_limit (ventana deslizante en la tabla rate_limits),
 * persistente entre instancias serverless — sustituye los Map en memoria.
 */

/**
 * Contrato mínimo del cliente Supabase necesario para el RPC.
 * Lo cumplen tanto createRouteHandlerClient (Route Handlers)
 * como getSupabaseAdmin() (Server Actions) — el caller pasa el suyo
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
  /**
   * Si el RPC falla (SQL no aplicado, red caída), aplica un bucket local al
   * proceso con el mismo max/window en vez de permitir incondicionalmente.
   * Best-effort: por instancia serverless, NO distribuido — solo cubre el
   * camino degradado. Default: true.
   */
  inMemoryFallback?: boolean;
}

/**
 * Buckets de ventana fija en memoria para el camino degradado (RPC caído).
 * Por instancia: se pierden en cold start y no se comparten entre lambdas.
 */
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

/** Poda de entradas expiradas cuando el Map crece (claves efímeras incluidas) */
const MEMORY_BUCKETS_PRUNE_THRESHOLD = 1000;

function checkMemoryFallback(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();

  if (memoryBuckets.size >= MEMORY_BUCKETS_PRUNE_THRESHOLD) {
    for (const [k, bucket] of memoryBuckets) {
      if (now >= bucket.resetAt) memoryBuckets.delete(k);
    }
  }

  const bucket = memoryBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    memoryBuckets.set(key, {
      count: 1,
      resetAt: now + opts.windowSeconds * 1000,
    });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= opts.max;
}

/**
 * Construye la clave de rate limit a partir de la IP de plataforma.
 *
 * - Con IP (string de `ipAddress(request)` de @vercel/functions): clave
 *   estable `prefix:ip`.
 * - Sin IP (local/origen desconocido): clave efímera `prefix:anon:<uuid>` —
 *   la request solo compite consigo misma. Nunca un literal compartido
 *   (p. ej. "127.0.0.1") que agruparía a todos los clientes de origen
 *   desconocido bajo el mismo bucket en un endpoint público (429 falsos).
 */
export function rateLimitKey(prefix: string, ip: string | undefined): string {
  if (ip) return `${prefix}:${ip}`;
  return `${prefix}:anon:${crypto.randomUUID()}`;
}

/**
 * Comprueba si la operación identificada por `key` está dentro del límite.
 *
 * FAIL-OPEN con red de seguridad: si el RPC no existe (SQL aún no aplicado)
 * o falla por cualquier motivo, NO se bloquea por fallo de infraestructura,
 * pero se aplica un bucket local al proceso (mismo max/window) para que el
 * camino degradado siga teniendo un límite best-effort por instancia.
 * Desactivable con `inMemoryFallback: false` (fail-open puro).
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
      return opts.inMemoryFallback === false || checkMemoryFallback(key, opts);
    }

    // Cualquier respuesta que no sea false explícito permite la operación
    return data !== false;
  } catch (err) {
    // fail-open también ante excepciones (red caída, cliente mal configurado)
    console.error("Rate limit RPC threw (fail-open):", err);
    return opts.inMemoryFallback === false || checkMemoryFallback(key, opts);
  }
}
