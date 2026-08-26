import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const env = getPublicEnv();
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          supabase: "error",
          message: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      supabase: "connected",
      projectUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown configuration error";

    return NextResponse.json(
      {
        ok: false,
        supabase: "misconfigured",
        message,
      },
      { status: 500 }
    );
  }
}
