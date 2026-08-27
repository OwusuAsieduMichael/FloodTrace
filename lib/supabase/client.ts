import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "@/lib/env";
import { supabaseCookieOptions } from "@/lib/supabase/cookie-options";

export function createClient() {
  const { url, anonKey } = getSupabasePublicConfig();

  return createBrowserClient(url, anonKey, {
    cookieOptions: supabaseCookieOptions(),
  });
}
