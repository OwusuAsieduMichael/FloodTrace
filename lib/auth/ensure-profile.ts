import type { User } from "@supabase/supabase-js";

import type { AuthProfile } from "@/lib/auth/redirects";
import { safePostLoginPath } from "@/lib/security/safe-path";
import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

const PROFILE_SELECT = "role, authority_status";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function roleFromMetadata(user: User): UserRole {
  return user.user_metadata?.role === "authority" ? "authority" : "citizen";
}

async function readProfile(
  userId: string,
  client: Awaited<ReturnType<typeof createClient>>
): Promise<AuthProfile | null> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile during auth handoff:", error);
    return null;
  }

  return (data as AuthProfile | null) ?? null;
}

async function waitForProfile(
  userId: string,
  client: Awaited<ReturnType<typeof createClient>>
): Promise<AuthProfile | null> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const profile = await readProfile(userId, client);
    if (profile) {
      return profile;
    }

    if (attempt < 7) {
      await delay(250);
    }
  }

  return null;
}

async function provisionMissingProfile(user: User): Promise<AuthProfile | null> {
  const admin = tryCreateAdminClient();
  if (!admin) {
    return null;
  }

  const role = roleFromMetadata(user);
  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name:
        user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      phone: user.user_metadata?.phone ?? null,
      role,
      authority_status: role === "authority" ? "approved" : null,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Failed to provision profile during auth handoff:", error);
    return null;
  }

  const { data } = await admin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  return (data as AuthProfile | null) ?? null;
}

async function ensureAuthorityApproved(
  userId: string,
  profile: AuthProfile
): Promise<AuthProfile> {
  if (profile.role !== "authority" || profile.authority_status !== "pending") {
    return profile;
  }

  const admin = tryCreateAdminClient();
  if (!admin) {
    return profile;
  }

  const { error } = await admin
    .from("profiles")
    .update({ authority_status: "approved" })
    .eq("id", userId)
    .eq("role", "authority")
    .eq("authority_status", "pending");

  if (error) {
    console.error("Failed to auto-approve authority during auth handoff:", error);
    return profile;
  }

  return { ...profile, authority_status: "approved" };
}

/**
 * Resolve a just-signed-in user to their workspace.
 * Returns null when the profile is still missing so the continue page can retry.
 */
export async function resolveAuthHandoff(
  requestedNext?: string | null
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "/auth/login";
  }

  let profile = await waitForProfile(user.id, supabase);

  if (!profile) {
    profile = await provisionMissingProfile(user);
  }

  if (!profile) {
    return null;
  }

  profile = await ensureAuthorityApproved(user.id, profile);
  return safePostLoginPath(requestedNext, profile);
}
