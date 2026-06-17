/**
 * Hook de instrumentación de Next.js (requiere experimental.instrumentationHook en Next 14).
 * Carga la configuración de Sentry del runtime correspondiente.
 * Solo se exporta register(): los hooks de error a nivel de request son de Next 15+.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
