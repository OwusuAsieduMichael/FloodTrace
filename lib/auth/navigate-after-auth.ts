import { createClient } from "@/lib/supabase/client";

/** Full navigation after auth so session cookies are sent on the next document request. */
export async function navigateAfterAuth(path: string) {
  try {
    const supabase = createClient();
    await supabase.auth.getSession();
  } catch {
    // Continue anyway; /auth/continue will send the user back to login if needed.
  }

  window.location.assign(path);
}
