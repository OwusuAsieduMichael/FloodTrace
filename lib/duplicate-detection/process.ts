import type { SupabaseClient } from "@supabase/supabase-js";

import type { IncidentType } from "@/types";

import { resolveDuplicateDetectionConfig } from "./config";
import { findDuplicateParentIncident } from "./find-duplicate";

export interface DuplicateDetectionInput {
  incidentId: string;
  incidentType: IncidentType;
  latitude: number;
  longitude: number;
  capturedAt: string;
}

export interface DuplicateDetectionResult {
  linked: boolean;
  parentIncidentId?: string;
}

export async function processDuplicateDetection(
  supabase: SupabaseClient,
  input: DuplicateDetectionInput
): Promise<DuplicateDetectionResult> {
  const config = await resolveDuplicateDetectionConfig();

  const parentIncidentId = await findDuplicateParentIncident({
    incidentType: input.incidentType,
    latitude: input.latitude,
    longitude: input.longitude,
    capturedAt: input.capturedAt,
    excludeIncidentId: input.incidentId,
    config,
  });

  if (!parentIncidentId) {
    return { linked: false };
  }

  const { error } = await supabase.rpc("link_incident_as_supporting", {
    p_supporting_incident_id: input.incidentId,
    p_parent_incident_id: parentIncidentId,
  });

  if (error) {
    return { linked: false };
  }

  return {
    linked: true,
    parentIncidentId,
  };
}
