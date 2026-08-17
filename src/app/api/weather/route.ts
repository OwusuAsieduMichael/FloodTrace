import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("units", "metric");
  url.searchParams.set("cnt", "1");
  url.searchParams.set("appid", process.env.OPENWEATHER_API_KEY ?? "");

  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Weather lookup failed" }, { status: 502 });
  }

  const data = await res.json();
  const slot = data.list?.[0];
  if (!slot) {
    return NextResponse.json({ error: "No forecast available" }, { status: 502 });
  }

  return NextResponse.json({
    tempC: Math.round(slot.main.temp),
    condition: slot.weather?.[0]?.main ?? "Unknown",
    rainProbability: Math.round((slot.pop ?? 0) * 100),
  });
}
