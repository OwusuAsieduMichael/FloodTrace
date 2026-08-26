import { createClient } from "@/lib/supabase/server";
import type { Incident, IncidentStatusHistory } from "@/types";

import {
  IN_PROGRESS_STATUSES,
  PENDING_STATUSES,
} from "./constants";

export interface CitizenIncidentStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface CitizenIncidentListItem {
  id: string;
  incident_type: Incident["incident_type"];
  description: string | null;
  location_name: string | null;
  severity: Incident["severity"];
  status: Incident["status"];
  submitted_at: string;
  latitude: number;
  longitude: number;
}

export async function getCitizenIncidentStats(
  userId: string
): Promise<CitizenIncidentStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select("status")
    .eq("reporter_id", userId);

  if (error || !data) {
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    };
  }

  return data.reduce<CitizenIncidentStats>(
    (stats, row) => {
      const status = row.status as Incident["status"];
      stats.total += 1;

      if (PENDING_STATUSES.includes(status)) {
        stats.pending += 1;
      } else if (IN_PROGRESS_STATUSES.includes(status)) {
        stats.inProgress += 1;
      } else if (status === "resolved") {
        stats.resolved += 1;
      } else if (status === "rejected") {
        stats.rejected += 1;
      }

      return stats;
    },
    {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    }
  );
}

export async function getCitizenRecentIncidents(
  userId: string,
  limit = 5
): Promise<CitizenIncidentListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, incident_type, description, location_name, severity, status, submitted_at, latitude, longitude"
    )
    .eq("reporter_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as CitizenIncidentListItem[];
}

export async function getCitizenIncidents(
  userId: string
): Promise<CitizenIncidentListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, incident_type, description, location_name, severity, status, submitted_at, latitude, longitude"
    )
    .eq("reporter_id", userId)
    .order("submitted_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as CitizenIncidentListItem[];
}

export async function getCitizenIncidentById(
  incidentId: string,
  userId: string
): Promise<Incident | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", incidentId)
    .eq("reporter_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Incident;
}

export async function getCitizenIncidentStatusHistory(
  incidentId: string
): Promise<IncidentStatusHistory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incident_status_history")
    .select("*")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as IncidentStatusHistory[];
}

export async function getCitizenIncidentMedia(incidentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incident_media")
    .select("*")
    .eq("incident_id", incidentId)
    .eq("media_source", "citizen_evidence")
    .order("uploaded_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const { attachSignedMediaUrls } = await import("@/lib/storage");

  return attachSignedMediaUrls(supabase, data);
}

export async function getPublicActiveIncidentCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("is_primary", true)
    .in("status", ["verified", "assigned"]);

  if (error || count === null) {
    return 0;
  }

  return count;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error || count === null) {
    return 0;
  }

  return count;
}
