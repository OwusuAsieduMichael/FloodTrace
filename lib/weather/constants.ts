import { DEFAULT_MAP_CENTER } from "@/lib/maps/constants";

export const WEATHER_CACHE_SECONDS = 600;

export const WEATHER_COORD_PRECISION = 3;

export const DEFAULT_WEATHER_LOCATION = {
  lat: DEFAULT_MAP_CENTER.lat,
  lng: DEFAULT_MAP_CENTER.lng,
  label: "Accra (map area)",
} as const;

export const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
