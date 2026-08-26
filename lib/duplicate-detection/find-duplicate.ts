import { createAdminClient } from "@/lib/supabase/admin";
import type { DuplicateDetectionConfig, IncidentType } from "@/types";

import { DUPLICATE_MATCH_STATUSES } from "./constants";
import { boundingBoxForRadius, distanceMeters } from "./haversine";

interface DuplicateCandidate {
  id: string;
  latitude: number;
  longitude: number;
  captured_at: string;
  submitted_at: string;
}

export interface FindDuplicateParentInput {
  incidentType: IncidentType;
  latitude: number;
  longitude: number;
  capturedAt: string;
  excludeIncidentId: string;
  config: DuplicateDetectionConfig;
}

export async function findDuplicateParentIncident(
  input: FindDuplicateParentInput
): Promise<string | null> {
  const { incidentType, latitude, longitude, capturedAt, excludeIncidentId, config } =
    input;

  const capturedAtMs = new Date(capturedAt).getTime();
  const windowMs = config.time_window_minutes * 60 * 1000;
  const windowStart = new Date(capturedAtMs - windowMs).toISOString();
  const windowEnd = new Date(capturedAtMs + windowMs).toISOString();
  const boundingBox = boundingBoxForRadius(latitude, longitude, config.radius_meters);

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("incidents")
    .select("id, latitude, longitude, captured_at, submitted_at")
    .eq("is_primary", true)
    .eq("incident_type", incidentType)
    .in("status", DUPLICATE_MATCH_STATUSES)
    .neq("id", excludeIncidentId)
    .gte("latitude", boundingBox.minLatitude)
    .lte("latitude", boundingBox.maxLatitude)
    .gte("longitude", boundingBox.minLongitude)
    .lte("longitude", boundingBox.maxLongitude)
    .gte("captured_at", windowStart)
    .lte("captured_at", windowEnd);

  if (error || !data?.length) {
    return null;
  }

  const matches = (data as DuplicateCandidate[])
    .map((candidate) => ({
      ...candidate,
      distance: distanceMeters(
        latitude,
        longitude,
        candidate.latitude,
        candidate.longitude
      ),
    }))
    .filter((candidate) => candidate.distance <= config.radius_meters)
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      return (
        new Date(left.submitted_at).getTime() - new Date(right.submitted_at).getTime()
      );
    });

  return matches[0]?.id ?? null;
}
