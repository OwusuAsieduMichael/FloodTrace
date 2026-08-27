export interface PlaceAddressParts {
  houseNumber?: string | null;
  road?: string | null;
  neighbourhood?: string | null;
  suburb?: string | null;
  cityDistrict?: string | null;
  city?: string | null;
  town?: string | null;
  village?: string | null;
  state?: string | null;
  country?: string | null;
}

function clean(value?: string | null): string | null {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed : null;
}

function pushUnique(parts: string[], seen: Set<string>, value: string | null) {
  if (!value) {
    return;
  }

  const key = value.toLowerCase();

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  parts.push(value);
}

/** Build a short, human-readable place label from reverse-geocode parts. */
export function formatPlaceName(
  parts: PlaceAddressParts,
  fallback?: string | null
): string | null {
  const road = clean(parts.road);
  const houseNumber = clean(parts.houseNumber);
  const street =
    road && houseNumber && !road.toLowerCase().startsWith(houseNumber.toLowerCase())
      ? `${houseNumber} ${road}`
      : road;
  const locality =
    clean(parts.neighbourhood) ||
    clean(parts.suburb) ||
    clean(parts.cityDistrict);
  const city = clean(parts.city) || clean(parts.town) || clean(parts.village);
  const state = clean(parts.state);
  const country = clean(parts.country);

  const assembled: string[] = [];
  const seen = new Set<string>();

  pushUnique(assembled, seen, street);
  pushUnique(assembled, seen, locality);
  pushUnique(assembled, seen, city);

  if (state && state.toLowerCase() !== city?.toLowerCase()) {
    pushUnique(assembled, seen, state);
  }

  if (country && country.toLowerCase() !== "ghana") {
    pushUnique(assembled, seen, country);
  }

  if (assembled.length > 0) {
    return assembled.join(", ").slice(0, 180);
  }

  const fallbackClean = clean(fallback);

  if (!fallbackClean) {
    return null;
  }

  return fallbackClean
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ")
    .slice(0, 180);
}
