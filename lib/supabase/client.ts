import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase para uso en el cliente (navegador).
// Lectura perezosa de env vars: instanciar a nivel de módulo rompe
// `next build` sin env vars (createClient lanza con URL vacía durante
// "Collecting page data"). Singleton memoizado por instancia.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }
  return client;
}
