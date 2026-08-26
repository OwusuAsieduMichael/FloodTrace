import { PUBLIC_MAP_STATUSES } from "@/lib/incidents/constants";
import { createClient } from "@/lib/supabase/server";
import type { IncidentSeverity, IncidentStatus, IncidentType } from "@/types";

export type PublicMapIncident = {
  id: string;
  incident_type: IncidentType;
  description: string | null;
  latitude: number;
  longitude: number;
  location_name: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  submitted_at: string;
  resolved_at: string | null;
};

/** Verified public incidents for the anonymous map (no reporter PII). */
export async function getPublicMapIncidents(): Promise<PublicMapIncident[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, incident_type, description, latitude, longitude, location_name, severity, status, submitted_at, resolved_at"
    )
    .eq("is_primary", true)
    .in("status", PUBLIC_MAP_STATUSES)
    .order("submitted_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as PublicMapIncident[];
}
