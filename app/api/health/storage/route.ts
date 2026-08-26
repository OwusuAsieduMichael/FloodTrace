import { NextResponse } from "next/server";

import { STORAGE_BUCKETS } from "@/lib/storage/constants";
import { requireAdminApi } from "@/lib/security/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

const REQUIRED_BUCKETS = Object.values(STORAGE_BUCKETS);

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const supabase = createAdminClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return NextResponse.json({ ok: false, storage: "error" }, { status: 503 });
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
  } catch {
    return NextResponse.json({ ok: false, storage: "misconfigured" }, { status: 500 });
  }
}
