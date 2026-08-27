import { formatPlaceName } from "@/lib/geo/place-name";
import { isValidCoordinate } from "@/lib/weather/get-weather";

const cache = new Map<string, string>();
const MAX_CACHE = 400;

interface NominatimAddress {
  house_number?: string;
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

interface BigDataCloudResponse {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
}

interface PhotonResponse {
  features?: Array<{
    properties?: {
      name?: string;
      street?: string;
      housenumber?: string;
      district?: string;
      city?: string;
      locality?: string;
      suburb?: string;
      state?: string;
      country?: string;
    };
  }>;
}

interface OpenWeatherGeoItem {
  name?: string;
  state?: string;
  country?: string;
}

function cacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

function remember(key: string, value: string) {
  if (cache.size >= MAX_CACHE) {
    cache.clear();
  }

  cache.set(key, value);
}

function nameScore(name: string): number {
  return name.split(",").length * 12 + Math.min(name.length, 80);
}

function pickRicher(...names: Array<string | null>): string | null {
  let best: string | null = null;
  let bestScore = -1;

  for (const name of names) {
    if (!name) {
      continue;
    }

    const score = nameScore(name);
    if (score > bestScore) {
      best = name;
      bestScore = score;
    }
  }

  return best;
}

async function fetchJson(
  url: URL,
  headers: Record<string, string>,
  timeoutMs = 5000
): Promise<unknown | null> {
  const response = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function lookupBigDataCloud(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", "en");

  const data = (await fetchJson(url, { Accept: "application/json" })) as
    | BigDataCloudResponse
    | null;

  if (!data) {
    return null;
  }

  return formatPlaceName({
    suburb: data.locality,
    city: data.city,
    state: data.principalSubdivision,
    country: data.countryName,
  });
}

async function lookupPhoton(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const url = new URL("https://photon.komoot.io/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  const data = (await fetchJson(
    url,
    {
      Accept: "application/json",
      "User-Agent":
        "FloodTrace/1.0 (flood incident reporting; https://github.com/OwusuAsieduMichael/FloodTrace)",
    },
    4000
  )) as PhotonResponse | null;

  const place = data?.features?.[0]?.properties;

  if (!place) {
    return null;
  }

  return formatPlaceName({
    houseNumber: place.housenumber,
    road: place.street || place.name,
    neighbourhood: place.district || place.locality,
    suburb: place.suburb,
    city: place.city,
    state: place.state,
    country: place.country,
  });
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

  const data = (await fetchJson(
    url,
    {
      Accept: "application/json",
      "User-Agent":
        "FloodTrace/1.0 (flood incident reporting; https://github.com/OwusuAsieduMichael/FloodTrace)",
    },
    4000
  )) as NominatimResponse | null;

  if (!data) {
    return null;
  }

  const address = data.address;

  return formatPlaceName(
    {
      houseNumber: address?.house_number,
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

  const data = (await fetchJson(url, { Accept: "application/json" })) as
    | OpenWeatherGeoItem[]
    | null;
  const place = data?.[0];

  if (!place?.name) {
    return null;
  }

  return formatPlaceName({
    city: place.name,
    state: place.state,
    country: place.country === "GH" ? "Ghana" : place.country,
  });
}

async function settledName(lookup: Promise<string | null>): Promise<string | null> {
  try {
    return await lookup;
  } catch {
    return null;
  }
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

  if (cached) {
    return cached;
  }

  const [photon, bigData] = await Promise.all([
    settledName(lookupPhoton(latitude, longitude)),
    settledName(lookupBigDataCloud(latitude, longitude)),
  ]);
  const fast = pickRicher(photon, bigData);

  if (fast) {
    remember(key, fast);
    return fast;
  }

  const nominatim = await settledName(lookupNominatim(latitude, longitude));

  if (nominatim) {
    remember(key, nominatim);
    return nominatim;
  }

  const openWeather = await settledName(lookupOpenWeather(latitude, longitude));

  if (openWeather) {
    remember(key, openWeather);
  }

  return openWeather;
}

export function locationCellKey(latitude: number, longitude: number): string {
  return cacheKey(latitude, longitude);
}
