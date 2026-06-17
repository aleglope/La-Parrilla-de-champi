import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase cookie-less para lectura pública desde el servidor
 * (Server Components). No depende de las APIs de request de Next (cookies()
 * y compañía), lo que preserva la generación estática/ISR de rutas como
 * /[lang]/menu — usar el cliente de server.ts (con cookies) las volvería
 * dinámicas.
 *
 * Usa la anon key (NUNCA service-role): la lectura corre bajo RLS como anon.
 * Lectura perezosa de env vars con fallback "" para no romper `next build`
 * sin env (misma convención que lib/supabase/client.ts).
 */
export function createPublicReadClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}
