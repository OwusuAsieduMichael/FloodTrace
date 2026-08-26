import type { WeatherData } from "@/types";

import { DEFAULT_WEATHER_LOCATION } from "./constants";
import { fetchOpenWeatherSnapshot } from "./openweather";

export type WeatherErrorCode =
  | "not_configured"
  | "invalid_location"
  | "unavailable";

export type WeatherResult =
  | { ok: true; data: WeatherData }
  | { ok: false; code: WeatherErrorCode; message: string };

export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export type WeatherLocationQuery =
  | { ok: true; mode: "default" }
  | { ok: true; mode: "coords"; latitude: number; longitude: number }
  | { ok: false; reason: "incomplete_pair" | "invalid_location" };

export function parseWeatherLocationQuery(
  latParam: string | null,
  lngParam: string | null
): WeatherLocationQuery {
  if (latParam === null && lngParam === null) {
    return { ok: true, mode: "default" };
  }

  if (latParam === null || lngParam === null) {
    return { ok: false, reason: "incomplete_pair" };
  }

  const latitude = Number(latParam);
  const longitude = Number(lngParam);

  if (!isValidCoordinate(latitude, longitude)) {
    return { ok: false, reason: "invalid_location" };
  }

  return { ok: true, mode: "coords", latitude, longitude };
}

export function getOpenWeatherApiKey(): string | null {
  const key = process.env.OPENWEATHER_API_KEY?.trim();
  return key ? key : null;
}

export async function getWeather(
  latitude: number = DEFAULT_WEATHER_LOCATION.lat,
  longitude: number = DEFAULT_WEATHER_LOCATION.lng
): Promise<WeatherResult> {
  if (!isValidCoordinate(latitude, longitude)) {
    return {
      ok: false,
      code: "invalid_location",
      message: "That location could not be used for a weather lookup.",
    };
  }

  const apiKey = getOpenWeatherApiKey();

  if (!apiKey) {
    return {
      ok: false,
      code: "not_configured",
      message:
        "Weather is not available yet. An administrator needs to configure the weather service.",
    };
  }

  try {
    const data = await fetchOpenWeatherSnapshot(latitude, longitude, apiKey);
    return { ok: true, data };
  } catch (error) {
    console.error("Weather lookup failed:", error);
    return {
      ok: false,
      code: "unavailable",
      message:
        "Current weather could not be loaded. Try again in a few minutes.",
    };
  }
}
