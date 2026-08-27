import { formatPlaceName } from "@/lib/geo/place-name";
import { isValidCoordinate } from "@/lib/weather/get-weather";

const cache = new Map<string, string | null>();
const MAX_CACHE = 400;

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  footway?: string;
  path?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  municipality?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  state?: string;
  country?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

interface OpenWeatherGeoItem {
  name?: string;
  state?: string;
  country?: string;
}

function cacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

function remember(key: string, value: string | null) {
  if (cache.size >= MAX_CACHE) {
    cache.clear();
  }

  cache.set(key, value);
}

async function lookupNominatim(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "FloodTrace/1.0 (flood incident reporting; https://github.com/OwusuAsieduMichael/FloodTrace)",
    },
    signal: AbortSignal.timeout(4500),
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimResponse;
  const address = data.address;

  return formatPlaceName(
    {
      road:
        address?.road ||
        address?.pedestrian ||
        address?.footway ||
        address?.path,
      neighbourhood: address?.neighbourhood,
      suburb: address?.suburb,
      cityDistrict: address?.city_district || address?.municipality,
      city: address?.city,
      town: address?.town,
      village: address?.village || address?.hamlet,
      state: address?.state,
      country: address?.country,
    },
    data.display_name
  );
}

async function lookupOpenWeather(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const url = new URL("https://api.openweathermap.org/geo/1.0/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("limit", "1");
  url.searchParams.set("appid", apiKey);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(4500),
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OpenWeatherGeoItem[];
  const place = data[0];

  if (!place?.name) {
    return null;
  }

  return formatPlaceName({
    city: place.name,
    state: place.state,
    country: place.country === "GH" ? "Ghana" : place.country,
  });
}

/** Resolve GPS to a readable area name. Returns null if lookup fails. */
export async function reverseGeocodePlaceName(
  latitude: number,
  longitude: number
): Promise<string | null> {
  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }

  const key = cacheKey(latitude, longitude);
  const cached = cache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  try {
    const name =
      (await lookupNominatim(latitude, longitude)) ||
      (await lookupOpenWeather(latitude, longitude));
    remember(key, name);
    return name;
  } catch {
    remember(key, null);
    return null;
  }
}
