import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { reverseGeocodePlaceName } from "./reverse-geocode";

/** Resolve and store a place name for older incidents that only have GPS. */
export async function persistMissingLocationName(incident: {
  id: string;
  location_name: string | null;
  latitude: number;
  longitude: number;
}): Promise<string | null> {
  if (incident.location_name?.trim()) {
    return incident.location_name.trim();
  }

  const name = await reverseGeocodePlaceName(
    incident.latitude,
    incident.longitude
  );

  if (!name) {
    return incident.location_name;
  }

  const supabase = tryCreateAdminClient() ?? (await createClient());
  await supabase
    .from("incidents")
    .update({ location_name: name })
    .eq("id", incident.id);

  return name;
}
