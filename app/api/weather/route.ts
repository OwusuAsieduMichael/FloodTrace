import type { NextRequest } from "next/server";

import { clientIpFromHeaders, rateLimit } from "@/lib/security/rate-limit";
import { getWeather, parseWeatherLocationQuery } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const limited = rateLimit(
    `weather:${clientIpFromHeaders(request.headers)}`,
    30,
    60_000
  );

  if (!limited.ok) {
    return Response.json(
      {
        ok: false,
        code: "unavailable",
        message: "Too many weather requests. Try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      }
    );
  }

  const location = parseWeatherLocationQuery(
    request.nextUrl.searchParams.get("lat"),
    request.nextUrl.searchParams.get("lng")
  );

  if (!location.ok) {
    return Response.json(
      {
        ok: false,
        code: "invalid_location",
        message:
          location.reason === "incomplete_pair"
            ? "Latitude and longitude must be provided together."
            : "That location could not be used for a weather lookup.",
      },
      { status: 400 }
    );
  }

  const result =
    location.mode === "default"
      ? await getWeather()
      : await getWeather(location.latitude, location.longitude);

  if (!result.ok) {
    const status =
      result.code === "invalid_location"
        ? 400
        : result.code === "not_configured"
          ? 503
          : 502;

    return Response.json(result, { status });
  }

  return Response.json(result);
}
