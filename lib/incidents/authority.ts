import { createClient } from "@/lib/supabase/server";
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentStatusHistory,
  IncidentType,
} from "@/types";

import { PENDING_STATUSES } from "./constants";

export interface AuthorityIncidentStats {
  total: number;
  pendingVerification: number;
  verified: number;
  assigned: number;
  resolved: number;
  critical: number;
  supportingReports: number;
}

export interface AuthorityIncidentListItem {
  id: string;
  incident_type: IncidentType;
  description: string | null;
  location_name: string | null;
  latitude: number;
  longitude: number;
  severity: IncidentSeverity;
  status: IncidentStatus;
  submitted_at: string;
  assigned_to: string | null;
  assignee_name: string | null;
  reporter_name: string | null;
  is_primary: boolean;
  parent_incident_id: string | null;
  supporting_count: number;
}

export interface AuthorityIncidentFilters {
  q?: string;
  status?: IncidentStatus | "pending";
  type?: IncidentType;
  severity?: IncidentSeverity;
  scope?: "primary" | "supporting" | "all";
}

export interface AuthorityIncidentDetail extends Incident {
  assignee_name: string | null;
  reporter_name: string | null;
}

async function loadProfileNames(
  ids: Array<string | null>
): Promise<Map<string, string | null>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const names = new Map<string, string | null>();

  if (unique.length === 0) {
    return names;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  if (error || !data) {
    return names;
  }

  for (const row of data) {
    names.set(row.id, row.full_name);
  }

  return names;
}

function matchesQuery(incident: AuthorityIncidentListItem, query: string): boolean {
  const q = query.trim().toLowerCase();

  if (!q) {
    return true;
  }

  const haystack = [
    incident.id,
    incident.id.replaceAll("-", ""),
    incident.id.slice(0, 8),
    incident.location_name ?? "",
    incident.description ?? "",
    incident.assignee_name ?? "",
    incident.reporter_name ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q.replaceAll("-", " ").trim()) || haystack.includes(q);
}

export async function getAuthorityIncidentStats(): Promise<AuthorityIncidentStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select("status, severity, is_primary");

  if (error || !data) {
    return {
      total: 0,
      pendingVerification: 0,
      verified: 0,
      assigned: 0,
      resolved: 0,
      critical: 0,
      supportingReports: 0,
    };
  }

  return data.reduce<AuthorityIncidentStats>(
    (stats, row) => {
      const status = row.status as IncidentStatus;
      const severity = row.severity as IncidentSeverity;

      if (!row.is_primary) {
        stats.supportingReports += 1;
        return stats;
      }

      stats.total += 1;

      if (PENDING_STATUSES.includes(status)) {
        stats.pendingVerification += 1;
      } else if (status === "verified") {
        stats.verified += 1;
      } else if (status === "assigned") {
        stats.assigned += 1;
      } else if (status === "resolved") {
        stats.resolved += 1;
      }

      if (severity === "critical") {
        stats.critical += 1;
      }

      return stats;
    },
    {
      total: 0,
      pendingVerification: 0,
      verified: 0,
      assigned: 0,
      resolved: 0,
      critical: 0,
      supportingReports: 0,
    }
  );
}

async function loadSupportingCounts(
  incidentIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (incidentIds.length === 0) {
    return counts;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supporting_reports")
    .select("parent_incident_id")
    .in("parent_incident_id", incidentIds);

  if (error || !data) {
    return counts;
  }

  for (const row of data) {
    const parentId = row.parent_incident_id as string;
    counts.set(parentId, (counts.get(parentId) ?? 0) + 1);
  }

  return counts;
}

async function fetchAuthorityIncidentRows(): Promise<AuthorityIncidentListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, incident_type, description, location_name, latitude, longitude, severity, status, submitted_at, assigned_to, reporter_id, is_primary, parent_incident_id"
    )
    .order("submitted_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load authority incidents:", error);
    return [];
  }

  const names = await loadProfileNames(
    data.flatMap((row) => [row.assigned_to as string | null, row.reporter_id as string])
  );
  const counts = await loadSupportingCounts(data.map((row) => row.id as string));

  return data.map((row) => ({
    id: row.id,
    incident_type: row.incident_type as IncidentType,
    description: row.description,
    location_name: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    severity: row.severity as IncidentSeverity,
    status: row.status as IncidentStatus,
    submitted_at: row.submitted_at,
    assigned_to: row.assigned_to,
    assignee_name: names.get(row.assigned_to as string) ?? null,
    reporter_name: names.get(row.reporter_id as string) ?? null,
    is_primary: row.is_primary,
    parent_incident_id: row.parent_incident_id,
    supporting_count: counts.get(row.id) ?? 0,
  }));
}

export function filterAuthorityIncidents(
  incidents: AuthorityIncidentListItem[],
  filters: AuthorityIncidentFilters
): AuthorityIncidentListItem[] {
  return incidents.filter((incident) => {
    if (filters.scope === "primary" && !incident.is_primary) {
      return false;
    }

    if (filters.scope === "supporting" && incident.is_primary) {
      return false;
    }

    if (filters.status === "pending") {
      if (!PENDING_STATUSES.includes(incident.status)) {
        return false;
      }
    } else if (filters.status && incident.status !== filters.status) {
      return false;
    }

    if (filters.type && incident.incident_type !== filters.type) {
      return false;
    }

    if (filters.severity && incident.severity !== filters.severity) {
      return false;
    }

    if (filters.q && !matchesQuery(incident, filters.q)) {
      return false;
    }

    return true;
  });
}

export async function getAuthorityIncidents(
  filters: AuthorityIncidentFilters = {}
): Promise<AuthorityIncidentListItem[]> {
  const incidents = await fetchAuthorityIncidentRows();
  return filterAuthorityIncidents(incidents, {
    scope: "primary",
    ...filters,
  });
}

export async function getAuthorityAttentionIncidents(
  limit = 8
): Promise<AuthorityIncidentListItem[]> {
  const incidents = await fetchAuthorityIncidentRows();

  return incidents
    .filter(
      (incident) =>
        incident.is_primary &&
        (PENDING_STATUSES.includes(incident.status) ||
          (incident.severity === "critical" &&
            incident.status !== "resolved" &&
            incident.status !== "rejected"))
    )
    .slice(0, limit);
}

export async function getAuthorityIncidentById(
  incidentId: string
): Promise<AuthorityIncidentDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", incidentId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const incident = data as Incident;
  const names = await loadProfileNames([incident.assigned_to, incident.reporter_id]);

  return {
    ...incident,
    reporter_name: names.get(incident.reporter_id) ?? null,
    assignee_name: incident.assigned_to
      ? (names.get(incident.assigned_to) ?? null)
      : null,
  };
}

export async function getAuthorityIncidentStatusHistory(
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

export async function getAuthorityIncidentMedia(incidentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incident_media")
    .select("*")
    .eq("incident_id", incidentId)
    .order("uploaded_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const { attachSignedMediaUrls } = await import("@/lib/storage");

  return attachSignedMediaUrls(supabase, data);
}

export async function getSupportingIncidents(
  parentIncidentId: string
): Promise<AuthorityIncidentListItem[]> {
  const supabase = await createClient();

  const { data: links, error: linkError } = await supabase
    .from("supporting_reports")
    .select("supporting_incident_id")
    .eq("parent_incident_id", parentIncidentId);

  if (linkError || !links || links.length === 0) {
    return [];
  }

  const ids = links.map((row) => row.supporting_incident_id as string);
  const incidents = await fetchAuthorityIncidentRows();

  return incidents.filter((incident) => ids.includes(incident.id));
}

export async function getAuthorityMapIncidents() {
  const incidents = await fetchAuthorityIncidentRows();

  return incidents
    .filter((incident) => incident.is_primary)
    .map((incident) => ({
      id: incident.id,
      incident_type: incident.incident_type,
      description: incident.description,
      latitude: incident.latitude,
      longitude: incident.longitude,
      location_name: incident.location_name,
      severity: incident.severity,
      status: incident.status,
      submitted_at: incident.submitted_at,
      resolved_at: null as string | null,
    }));
}

export function parseAuthorityIncidentFilters(searchParams: {
  q?: string;
  status?: string;
  type?: string;
  severity?: string;
  scope?: string;
}): AuthorityIncidentFilters {
  const status = searchParams.status;
  const type = searchParams.type;
  const severity = searchParams.severity;
  const scope = searchParams.scope;

  return {
    q: searchParams.q?.trim() || undefined,
    status:
      status === "pending" ||
      status === "submitted" ||
      status === "pending_review" ||
      status === "verified" ||
      status === "assigned" ||
      status === "resolved" ||
      status === "rejected"
        ? status
        : undefined,
    type: type === "flood" || type === "blocked_drain" ? type : undefined,
    severity:
      severity === "low" ||
      severity === "medium" ||
      severity === "high" ||
      severity === "critical"
        ? severity
        : undefined,
    scope:
      scope === "supporting" || scope === "all" || scope === "primary"
        ? scope
        : "primary",
  };
}
