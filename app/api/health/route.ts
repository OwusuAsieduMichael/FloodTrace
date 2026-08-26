import { NextResponse } from "next/server";

import { clientIpFromHeaders, rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const limited = rateLimit(
    `health:${clientIpFromHeaders(request.headers)}`,
    60,
    60_000
  );

  if (!limited.ok) {
    return NextResponse.json(
      { ok: false },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      }
    );
  }

  return NextResponse.json({ ok: true });
}
