import { NextResponse } from "next/server";

import { STORAGE_BUCKETS } from "@/lib/storage/constants";
import { createAdminClient } from "@/lib/supabase/admin";

const REQUIRED_BUCKETS = Object.values(STORAGE_BUCKETS);

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          storage: "error",
          message: error.message,
        },
        { status: 503 }
      );
    }

    const bucketIds = new Set(buckets?.map((bucket) => bucket.id) ?? []);
    const status = Object.fromEntries(
      REQUIRED_BUCKETS.map((id) => [id, bucketIds.has(id)])
    );
    const allOk = REQUIRED_BUCKETS.every((id) => bucketIds.has(id));

    return NextResponse.json(
      {
        ok: allOk,
        storage: allOk ? "ready" : "missing",
        buckets: status,
      },
      { status: allOk ? 200 : 503 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown storage error";

    return NextResponse.json(
      {
        ok: false,
        storage: "misconfigured",
        message,
      },
      { status: 500 }
    );
  }
}
