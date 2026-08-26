import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/security/require-admin-api";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ ok: false, supabase: "error" }, { status: 503 });
    }

    return NextResponse.json({ ok: true, supabase: "connected" });
  } catch {
    return NextResponse.json({ ok: false, supabase: "misconfigured" }, { status: 500 });
  }
}
