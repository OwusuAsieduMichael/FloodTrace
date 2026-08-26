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

    const [profiles, incidents, config] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("incidents").select("id", { count: "exact", head: true }),
      supabase.from("app_config").select("key").limit(1),
    ]);

    const tables = {
      profiles: !profiles.error,
      incidents: !incidents.error,
      app_config: !config.error,
    };

    const allOk = Object.values(tables).every(Boolean);

    return NextResponse.json(
      {
        ok: allOk,
        schema: allOk ? "ready" : "missing",
        tables,
      },
      { status: allOk ? 200 : 503 }
    );
  } catch {
    return NextResponse.json({ ok: false, schema: "error" }, { status: 500 });
  }
}
