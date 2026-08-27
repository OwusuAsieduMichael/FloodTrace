import { createClient } from "@supabase/supabase-js";

import { getServerEnv, getSupabasePublicConfig } from "@/lib/env";

/**
 * Service-role Supabase client for trusted server-side operations only.
 * Never import this module from client components or expose to the browser.
 */
export function tryCreateAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createAdminClient();
}

export function createAdminClient() {
  const { url } = getSupabasePublicConfig();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin Supabase operations."
    );
  }

  return createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
