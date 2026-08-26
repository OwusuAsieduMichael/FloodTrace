import type { WeatherCondition, WeatherData, WeatherForecastDay } from "@/types";

import { OPENWEATHER_BASE_URL, WEATHER_CACHE_SECONDS } from "./constants";
import { roundCoordinate } from "./format";

interface OpenWeatherCondition {
  id?: number;
  main?: string;
  description?: string;
  icon?: string;
}

interface OpenWeatherCurrentResponse {
  dt?: number;
  name?: string;
  weather?: OpenWeatherCondition[];
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
  };
  wind?: {
    speed?: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  sys?: {
    country?: string;
  };
}

interface OpenWeatherForecastItem {
  dt?: number;
  weather?: OpenWeatherCondition[];
  main?: {
    temp?: number;
    temp_min?: number;
    temp_max?: number;
  };
  rain?: {
    "3h"?: number;
  };
}

interface OpenWeatherForecastResponse {
  list?: OpenWeatherForecastItem[];
  city?: {
    name?: string;
    timezone?: number;
    country?: string;
  };
}

function mapCondition(raw: OpenWeatherCondition | undefined): WeatherCondition | null {
  if (!raw?.description || !raw.icon) {
    return null;
  }

  return {
    id: raw.id ?? 0,
    main: raw.main ?? "Unknown",
    description: raw.description,
    icon: raw.icon,
  };
}

function localDateKey(unixSeconds: number, tzOffsetSeconds: number): string {
  const shifted = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localHour(unixSeconds: number, tzOffsetSeconds: number): number {
  return new Date((unixSeconds + tzOffsetSeconds) * 1000).getUTCHours();
}

function buildForecast(
  items: OpenWeatherForecastItem[],
  tzOffsetSeconds: number
): WeatherForecastDay[] {
  const byDay = new Map<
    string,
    {
      minC: number;
      maxC: number;
      rainfallMm: number;
      representative: { hourDistance: number; condition: WeatherCondition };
    }
  >();

  for (const item of items) {
    if (typeof item.dt !== "number") {
      continue;
    }

    const condition = mapCondition(item.weather?.[0]);
    const minC = item.main?.temp_min ?? item.main?.temp;
    const maxC = item.main?.temp_max ?? item.main?.temp;

    if (!condition || typeof minC !== "number" || typeof maxC !== "number") {
      continue;
    }

    const date = localDateKey(item.dt, tzOffsetSeconds);
    const hourDistance = Math.abs(localHour(item.dt, tzOffsetSeconds) - 12);
    const rainfallMm = item.rain?.["3h"] ?? 0;
    const existing = byDay.get(date);

    if (!existing) {
      byDay.set(date, {
        minC,
        maxC,
        rainfallMm,
        representative: { hourDistance, condition },
      });
      continue;
    }

    existing.minC = Math.min(existing.minC, minC);
    existing.maxC = Math.max(existing.maxC, maxC);
    existing.rainfallMm += rainfallMm;

    if (hourDistance < existing.representative.hourDistance) {
      existing.representative = { hourDistance, condition };
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 5)
    .map(([date, day]) => ({
      date,
      minC: day.minC,
      maxC: day.maxC,
      rainfallMm: Math.round(day.rainfallMm * 10) / 10,
      condition: day.representative.condition,
    }));
}

async function fetchOpenWeatherJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: WEATHER_CACHE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`OpenWeatherMap request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function fetchOpenWeatherSnapshot(
  latitude: number,
  longitude: number,
  apiKey: string
): Promise<WeatherData> {
  const lat = roundCoordinate(latitude);
  const lon = roundCoordinate(longitude);
  const query = `lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const [current, forecast] = await Promise.all([
    fetchOpenWeatherJson<OpenWeatherCurrentResponse>(
      `${OPENWEATHER_BASE_URL}/weather?${query}`
    ),
    fetchOpenWeatherJson<OpenWeatherForecastResponse>(
      `${OPENWEATHER_BASE_URL}/forecast?${query}`
    ),
  ]);

  const condition = mapCondition(current.weather?.[0]);
  const temperatureC = current.main?.temp;
  const feelsLikeC = current.main?.feels_like;
  const humidity = current.main?.humidity;
  const observedUnix = current.dt;

  if (
    !condition ||
    typeof temperatureC !== "number" ||
    typeof feelsLikeC !== "number" ||
    typeof humidity !== "number" ||
    typeof observedUnix !== "number"
  ) {
    throw new Error("OpenWeatherMap returned an incomplete current-weather payload.");
  }

  const cityName = forecast.city?.name || current.name || "Selected location";
  const country = forecast.city?.country || current.sys?.country;
  const locationName = country ? `${cityName}, ${country}` : cityName;
  const tzOffset = forecast.city?.timezone ?? 0;

  return {
    latitude: lat,
    longitude: lon,
    locationName,
    current: {
      temperatureC,
      feelsLikeC,
      humidity,
      windSpeedMs:
        typeof current.wind?.speed === "number" ? current.wind.speed : null,
      rainfallMmLastHour:
        typeof current.rain?.["1h"] === "number" ? current.rain["1h"] : null,
      rainfallMmLast3Hours:
        typeof current.rain?.["3h"] === "number" ? current.rain["3h"] : null,
      condition,
      observedAt: new Date(observedUnix * 1000).toISOString(),
    },
    forecast: buildForecast(forecast.list ?? [], tzOffset),
    source: "openweathermap",
    fetchedAt: new Date().toISOString(),
  };
}
