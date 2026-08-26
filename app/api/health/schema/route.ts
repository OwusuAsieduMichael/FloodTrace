import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [profiles, incidents, config] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("incidents").select("id", { count: "exact", head: true }),
      supabase.from("app_config").select("key").limit(5),
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
        errors: {
          profiles: profiles.error?.message ?? null,
          incidents: incidents.error?.message ?? null,
          app_config: config.error?.message ?? null,
        },
      },
      { status: allOk ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        schema: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
