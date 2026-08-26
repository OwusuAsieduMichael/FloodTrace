import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth/session";

export async function requireAdminApi() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
