import { redirect } from "next/navigation";

import { getPortalAccessRedirect } from "@/lib/auth/session-redirect";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

const PROFILE_COLUMNS =
  "id, full_name, phone, avatar_url, role, authority_status, created_at, updated_at";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return data as Profile;
}

export async function requirePortalSession(role: UserRole): Promise<{
  profile: Profile;
  email: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error);
  }

  const profile = (data as Profile | null) ?? null;
  const nextPath = getPortalAccessRedirect(role, true, profile);

  if (nextPath) {
    redirect(nextPath);
  }

  return { profile: profile as Profile, email: user.email ?? "" };
}

export async function requirePortalProfile(role: UserRole): Promise<Profile> {
  const { profile } = await requirePortalSession(role);
  return profile;
}
