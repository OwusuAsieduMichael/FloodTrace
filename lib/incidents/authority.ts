import { persistMissingLocationName } from "@/lib/geo/persist-location-name";
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
  limit?: number;
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

type IncidentRow = {
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
  reporter_id: string;
  is_primary: boolean;
  parent_incident_id: string | null;
};

async function mapIncidentRows(
  data: IncidentRow[]
): Promise<AuthorityIncidentListItem[]> {
  const names = await loadProfileNames(
    data.flatMap((row) => [row.assigned_to, row.reporter_id])
  );
  const counts = await loadSupportingCounts(data.map((row) => row.id));

  return data.map((row) => ({
    id: row.id,
    incident_type: row.incident_type,
    description: row.description,
    location_name: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    severity: row.severity,
    status: row.status,
    submitted_at: row.submitted_at,
    assigned_to: row.assigned_to,
    assignee_name: names.get(row.assigned_to ?? "") ?? null,
    reporter_name: names.get(row.reporter_id) ?? null,
    is_primary: row.is_primary,
    parent_incident_id: row.parent_incident_id,
    supporting_count: counts.get(row.id) ?? 0,
  }));
}

async function fetchAuthorityIncidentRows(
  filters: AuthorityIncidentFilters = {}
): Promise<AuthorityIncidentListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("incidents")
    .select(
      "id, incident_type, description, location_name, latitude, longitude, severity, status, submitted_at, assigned_to, reporter_id, is_primary, parent_incident_id"
    )
    .order("submitted_at", { ascending: false });

  if (filters.scope === "primary") {
    query = query.eq("is_primary", true);
  } else if (filters.scope === "supporting") {
    query = query.eq("is_primary", false);
  }

  if (filters.status === "pending") {
    query = query.in("status", PENDING_STATUSES);
  } else if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.type) {
    query = query.eq("incident_type", filters.type);
  }

  if (filters.severity) {
    query = query.eq("severity", filters.severity);
  }

  if (filters.limit && !filters.q) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Failed to load authority incidents:", error);
    return [];
  }

  return mapIncidentRows(data as IncidentRow[]);
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
  const resolved: AuthorityIncidentFilters = {
    scope: "primary",
    ...filters,
  };
  const incidents = await fetchAuthorityIncidentRows(resolved);
  const filtered = filterAuthorityIncidents(incidents, resolved);

  return resolved.limit ? filtered.slice(0, resolved.limit) : filtered;
}

export async function getAuthorityAttentionIncidents(
  limit = 8
): Promise<AuthorityIncidentListItem[]> {
  const [pending, critical] = await Promise.all([
    fetchAuthorityIncidentRows({
      scope: "primary",
      status: "pending",
      limit,
    }),
    fetchAuthorityIncidentRows({
      scope: "primary",
      severity: "critical",
      limit: limit * 2,
    }),
  ]);

  const seen = new Set<string>();
  const merged: AuthorityIncidentListItem[] = [];

  for (const incident of [...pending, ...critical]) {
    if (seen.has(incident.id)) {
      continue;
    }

    const needsAttention =
      PENDING_STATUSES.includes(incident.status) ||
      (incident.severity === "critical" &&
        incident.status !== "resolved" &&
        incident.status !== "rejected");

    if (!needsAttention) {
      continue;
    }

    seen.add(incident.id);
    merged.push(incident);
  }

  return merged
    .sort(
      (left, right) =>
        new Date(right.submitted_at).getTime() -
        new Date(left.submitted_at).getTime()
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
  const locationName = await persistMissingLocationName(incident);
  const names = await loadProfileNames([incident.assigned_to, incident.reporter_id]);

  return {
    ...incident,
    location_name: locationName,
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
  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, incident_type, description, location_name, latitude, longitude, severity, status, submitted_at, assigned_to, reporter_id, is_primary, parent_incident_id"
    )
    .in("id", ids)
    .order("submitted_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return mapIncidentRows(data as IncidentRow[]);
}

export async function getAuthorityMapIncidents() {
  const incidents = await fetchAuthorityIncidentRows({ scope: "primary" });

  return incidents
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
