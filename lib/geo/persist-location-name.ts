import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import {
  locationCellKey,
  reverseGeocodePlaceName,
} from "./reverse-geocode";

const MAX_LOOKUPS_PER_REQUEST = 12;

type Locatable = {
  id: string;
  location_name: string | null;
  latitude: number;
  longitude: number;
};

/** Resolve and store a place name for older incidents that only have GPS. */
export async function persistMissingLocationName(incident: {
  id: string;
  location_name: string | null;
  latitude: number;
  longitude: number;
}): Promise<string | null> {
  const [filled] = await fillMissingLocationNames([incident]);
  return filled?.location_name ?? incident.location_name;
}

/** Reverse-geocode and persist names for incidents that still only have GPS. */
export async function fillMissingLocationNames<T extends Locatable>(
  incidents: T[]
): Promise<T[]> {
  const missing = incidents.filter((incident) => !incident.location_name?.trim());

  if (missing.length === 0) {
    return incidents;
  }

  const cells = new Map<string, { latitude: number; longitude: number }>();

  for (const incident of missing) {
    const key = locationCellKey(incident.latitude, incident.longitude);
    if (!cells.has(key)) {
      cells.set(key, {
        latitude: incident.latitude,
        longitude: incident.longitude,
      });
    }
  }

  const unique = [...cells.entries()].slice(0, MAX_LOOKUPS_PER_REQUEST);
  const names = new Map<string, string>();

  await Promise.all(
    unique.map(async ([key, point]) => {
      const name = await reverseGeocodePlaceName(point.latitude, point.longitude);
      if (name) {
        names.set(key, name);
      }
    })
  );

  if (names.size === 0) {
    return incidents;
  }

  const supabase = tryCreateAdminClient() ?? (await createClient());
  const updates: Array<{ id: string; location_name: string }> = [];

  for (const incident of missing) {
    const name = names.get(
      locationCellKey(incident.latitude, incident.longitude)
    );
    if (name) {
      updates.push({ id: incident.id, location_name: name });
    }
  }

  await Promise.all(
    updates.map((update) =>
      supabase
        .from("incidents")
        .update({ location_name: update.location_name })
        .eq("id", update.id)
    )
  );

  const byId = new Map(updates.map((update) => [update.id, update.location_name]));

  return incidents.map((incident) => {
    const locationName = byId.get(incident.id);
    return locationName ? { ...incident, location_name: locationName } : incident;
  });
}
