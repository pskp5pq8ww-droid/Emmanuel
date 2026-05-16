import { createClient } from "@supabase/supabase-js";
import {
  getMissingSupabaseEnv,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  logSupabaseEnvStatus,
} from "./env";
import type { Database } from "./types";

export function createSupabaseAdminClient() {
  const missing = getMissingSupabaseEnv(true);

  if (missing.length) {
    logSupabaseEnvStatus("admin-client", true);
    throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`);
  }

  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
