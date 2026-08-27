import type { NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth/session";
import { reverseGeocodePlaceName } from "@/lib/geo/reverse-geocode";
import { clientIpFromHeaders, rateLimit } from "@/lib/security/rate-limit";
import { isValidCoordinate } from "@/lib/weather/get-weather";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return Response.json({ ok: false, name: null }, { status: 401 });
  }

  const limited = rateLimit(
    `geo-reverse:${profile.id}:${clientIpFromHeaders(request.headers)}`,
    20,
    60_000
  );

  if (!limited.ok) {
    return Response.json(
      { ok: false, name: null },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      }
    );
  }

  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lng"));

  if (!isValidCoordinate(latitude, longitude)) {
    return Response.json({ ok: false, name: null }, { status: 400 });
  }

  const name = await reverseGeocodePlaceName(latitude, longitude);

  return Response.json({ ok: true, name });
}
