"use client";

import { createClient } from "@/lib/supabase/client";

export async function signOutToLanding() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.assign("/");
}
