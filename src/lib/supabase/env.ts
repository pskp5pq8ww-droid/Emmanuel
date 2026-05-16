type SupabaseEnvStatus = {
  url: boolean;
  publicKey: boolean;
  serviceRoleKey: boolean;
  publicKeyName: "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | null;
};

function clean(value: string | undefined) {
  return value?.trim() || "";
}

export function getSupabaseUrl() {
  // NEXT_PUBLIC_ prefix is required for client-side access.
  // SUPABASE_URL (without prefix) works as server-side fallback only.
  return (
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    clean(process.env.SUPABASE_URL)
  );
}

export function getSupabasePublishableKey() {
  return (
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getSupabasePublicKeyName(): SupabaseEnvStatus["publicKeyName"] {
  if (clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return "NEXT_PUBLIC_SUPABASE_ANON_KEY";
  if (clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) return "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
  return null;
}

export function getSupabaseServiceRoleKey() {
  return clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  return {
    url: Boolean(getSupabaseUrl()),
    publicKey: Boolean(getSupabasePublishableKey()),
    serviceRoleKey: Boolean(getSupabaseServiceRoleKey()),
    publicKeyName: getSupabasePublicKeyName(),
  };
}

export function getMissingSupabaseEnv(includeServiceRole = false) {
  const missing: string[] = [];
  if (!getSupabaseUrl()) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!getSupabasePublishableKey()) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  if (includeServiceRole && !getSupabaseServiceRoleKey()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  return missing;
}

export function logSupabaseEnvStatus(context: string, includeServiceRole = false) {
  const status = getSupabaseEnvStatus();
  const missing = getMissingSupabaseEnv(includeServiceRole);

  if (missing.length) {
    console.error(`[Supabase:${context}] Missing env vars`, {
      missing,
      hasUrl: status.url,
      hasPublicKey: status.publicKey,
      publicKeyName: status.publicKeyName,
      hasServiceRoleKey: status.serviceRoleKey,
    });
  } else {
    console.info(`[Supabase:${context}] Env OK`, {
      hasUrl: status.url,
      hasPublicKey: status.publicKey,
      publicKeyName: status.publicKeyName,
      hasServiceRoleKey: status.serviceRoleKey,
    });
  }
}

/** Safe debug — shows existence only, never prints secret values. */
export function debugSupabaseEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 12) || "(empty)",
    },
    SUPABASE_URL_fallback: Boolean(process.env.SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}
