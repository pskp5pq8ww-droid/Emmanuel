import { createClient } from "@supabase/supabase-js";
import { getMissingSupabaseEnv, getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";
import type { Database } from "./types";

export function createSupabaseAdminClient() {
  const missing = getMissingSupabaseEnv(true);

  if (missing.length) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(", " )}`);
  }

  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
