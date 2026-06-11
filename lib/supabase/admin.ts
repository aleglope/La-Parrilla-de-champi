import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente service-role (solo Server Actions).
// Lectura perezosa de env vars: ver nota en client.ts — el singleton eager
// rompía `next build` sin env vars. Memoizado por instancia serverless.
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return adminClient;
}
