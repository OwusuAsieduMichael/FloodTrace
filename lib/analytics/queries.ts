import { createClient } from "@/lib/supabase/server";
import {
  ALL_INCIDENT_STATUSES,
  INCIDENT_TYPE_LABELS,
  PENDING_STATUSES,
  SEVERITY_LABELS,
  TIMELINE_LABELS,
} from "@/lib/incidents/constants";
import type { IncidentSeverity, IncidentStatus, IncidentType } from "@/types";

import {
  formatPercent,
  hoursBetween,
  median,
  rangeStartIso,
  utcDateKey,
  type AnalyticsRange,
} from "./range";

const PAGE_SIZE = 1000;
const TREND_DAYS: Record<Exclude<AnalyticsRange, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export interface NamedCount {
  key: string;
  label: string;
  count: number;
}

export interface TrendPoint {
  key: string;
  label: string;
  count: number;
}

export interface LocationCluster {
  key: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
  count: number;
}

export interface WorkloadRow {
  id: string;
  name: string;
  count: number;
}

export interface AccountStats {
  citizens: number;
  authoritiesPending: number;
  authoritiesApproved: number;
  authoritiesRejected: number;
  admins: number;
}

export interface AnalyticsSnapshot {
  range: AnalyticsRange;
  generatedAt: string;
  primaries: number;
  supporting: number;
  pendingVerification: number;
  verified: number;
  assigned: number;
  resolved: number;
  rejected: number;
  critical: number;
  resolutionRate: string | null;
  rejectionRate: string | null;
  medianVerifyHours: number | null;
  medianResolveHours: number | null;
  verifySampleSize: number;
  resolveSampleSize: number;
  byStatus: NamedCount[];
  bySeverity: NamedCount[];
  byType: NamedCount[];
  trend: TrendPoint[];
  clusters: LocationCluster[];
  workload: WorkloadRow[];
}

type IncidentRow = {
  id: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  submitted_at: string;
  resolved_at: string | null;
  is_primary: boolean;
  latitude: number;
  longitude: number;
  location_name: string | null;
  assigned_to: string | null;
};

async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Analytics query failed:", error);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

function buildTrend(range: AnalyticsRange, primaries: IncidentRow[]): TrendPoint[] {
  const days = range === "all" ? 90 : TREND_DAYS[range];
  const today = utcDateKey(new Date().toISOString());
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const counts = new Map<string, number>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000);
    counts.set(date.toISOString().slice(0, 10), 0);
  }

  for (const incident of primaries) {
    const key = utcDateKey(incident.submitted_at);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([key, count]) => ({
    key,
    label: key.slice(5),
    count,
  }));
}

function buildClusters(primaries: IncidentRow[]): LocationCluster[] {
  const buckets = new Map<
    string,
    { count: number; lat: number; lng: number; names: Map<string, number> }
  >();

  for (const incident of primaries) {
    const lat = Math.round(incident.latitude * 100) / 100;
    const lng = Math.round(incident.longitude * 100) / 100;
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const existing = buckets.get(key);

    if (!existing) {
      const names = new Map<string, number>();
      if (incident.location_name) {
        names.set(incident.location_name, 1);
      }
      buckets.set(key, { count: 1, lat, lng, names });
      continue;
    }

    existing.count += 1;
    if (incident.location_name) {
      existing.names.set(
        incident.location_name,
        (existing.names.get(incident.location_name) ?? 0) + 1
      );
    }
  }

  return [...buckets.entries()]
    .map(([key, value]) => {
      let locationName: string | null = null;
      let top = 0;
      for (const [name, count] of value.names) {
        if (count > top) {
          top = count;
          locationName = name;
        }
      }

      return {
        key,
        latitude: value.lat,
        longitude: value.lng,
        location_name: locationName,
        count: value.count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export async function getIncidentAnalytics(
  range: AnalyticsRange
): Promise<AnalyticsSnapshot> {
  const supabase = await createClient();
  const startIso = rangeStartIso(range);

  const incidents = await fetchAllRows<IncidentRow>((from, to) => {
    let query = supabase
      .from("incidents")
      .select(
        "id, incident_type, severity, status, submitted_at, resolved_at, is_primary, latitude, longitude, location_name, assigned_to"
      )
      .order("submitted_at", { ascending: false });

    if (startIso) {
      query = query.gte("submitted_at", startIso);
    }

    return query.range(from, to);
  });

  const primaries = incidents.filter((row) => row.is_primary);
  const supporting = incidents.length - primaries.length;

  const byStatusMap = new Map<IncidentStatus, number>();
  const bySeverityMap = new Map<IncidentSeverity, number>();
  const byTypeMap = new Map<IncidentType, number>();
  const workloadCounts = new Map<string, number>();

  let pendingVerification = 0;
  let verified = 0;
  let assigned = 0;
  let resolved = 0;
  let rejected = 0;
  let critical = 0;
  const resolveDurations: number[] = [];

  for (const incident of primaries) {
    byStatusMap.set(incident.status, (byStatusMap.get(incident.status) ?? 0) + 1);
    bySeverityMap.set(
      incident.severity,
      (bySeverityMap.get(incident.severity) ?? 0) + 1
    );
    byTypeMap.set(
      incident.incident_type,
      (byTypeMap.get(incident.incident_type) ?? 0) + 1
    );

    if (PENDING_STATUSES.includes(incident.status)) {
      pendingVerification += 1;
    } else if (incident.status === "verified") {
      verified += 1;
    } else if (incident.status === "assigned") {
      assigned += 1;
    } else if (incident.status === "resolved") {
      resolved += 1;
    } else if (incident.status === "rejected") {
      rejected += 1;
    }

    if (incident.severity === "critical") {
      critical += 1;
    }

    if (incident.status === "resolved" && incident.resolved_at) {
      const hours = hoursBetween(incident.submitted_at, incident.resolved_at);
      if (hours >= 0) {
        resolveDurations.push(hours);
      }
    }

    if (incident.status === "assigned" && incident.assigned_to) {
      workloadCounts.set(
        incident.assigned_to,
        (workloadCounts.get(incident.assigned_to) ?? 0) + 1
      );
    }
  }

  const primaryIds = primaries.map((row) => row.id);
  const verifyDurations: number[] = [];

  if (primaryIds.length > 0) {
    const submittedById = new Map(primaries.map((row) => [row.id, row.submitted_at]));
    const verifiedAt = new Map<string, string>();

    for (let i = 0; i < primaryIds.length; i += 200) {
      const chunk = primaryIds.slice(i, i + 200);
      const history = await fetchAllRows<{
        incident_id: string;
        created_at: string;
      }>((from, to) =>
        supabase
          .from("incident_status_history")
          .select("incident_id, created_at")
          .eq("new_status", "verified")
          .in("incident_id", chunk)
          .order("created_at", { ascending: true })
          .range(from, to)
      );

      for (const row of history) {
        if (!verifiedAt.has(row.incident_id)) {
          verifiedAt.set(row.incident_id, row.created_at);
        }
      }
    }

    for (const [id, verifiedTime] of verifiedAt) {
      const submitted = submittedById.get(id);
      if (!submitted) {
        continue;
      }
      const hours = hoursBetween(submitted, verifiedTime);
      if (hours >= 0) {
        verifyDurations.push(hours);
      }
    }
  }

  const assigneeIds = [...workloadCounts.keys()];
  const names = new Map<string, string | null>();

  if (assigneeIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", assigneeIds);

    for (const profile of profiles ?? []) {
      names.set(profile.id, profile.full_name);
    }
  }

  const byStatus = ALL_INCIDENT_STATUSES.map((status) => ({
    key: status,
    label: TIMELINE_LABELS[status],
    count: byStatusMap.get(status) ?? 0,
  }));

  const severityOrder: IncidentSeverity[] = ["critical", "high", "medium", "low"];
  const bySeverity = severityOrder.map((severity) => ({
    key: severity,
    label: SEVERITY_LABELS[severity],
    count: bySeverityMap.get(severity) ?? 0,
  }));

  const typeOrder: IncidentType[] = ["flood", "blocked_drain"];
  const byType = typeOrder.map((type) => ({
    key: type,
    label: INCIDENT_TYPE_LABELS[type],
    count: byTypeMap.get(type) ?? 0,
  }));

  return {
    range,
    generatedAt: new Date().toISOString(),
    primaries: primaries.length,
    supporting,
    pendingVerification,
    verified,
    assigned,
    resolved,
    rejected,
    critical,
    resolutionRate: formatPercent(resolved, primaries.length),
    rejectionRate: formatPercent(rejected, primaries.length),
    medianVerifyHours: median(verifyDurations),
    medianResolveHours: median(resolveDurations),
    verifySampleSize: verifyDurations.length,
    resolveSampleSize: resolveDurations.length,
    byStatus,
    bySeverity,
    byType,
    trend: buildTrend(range, primaries),
    clusters: buildClusters(primaries),
    workload: [...workloadCounts.entries()]
      .map(([id, count]) => ({
        id,
        name: names.get(id)?.trim() || `Officer ${id.slice(0, 8).toUpperCase()}`,
        count,
      }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getAccountAnalytics(): Promise<AccountStats> {
  const supabase = await createClient();
  const rows = await fetchAllRows<{
    role: string;
    authority_status: string | null;
  }>((from, to) =>
    supabase
      .from("profiles")
      .select("role, authority_status")
      .range(from, to)
  );

  return rows.reduce<AccountStats>(
    (stats, row) => {
      if (row.role === "citizen") {
        stats.citizens += 1;
      } else if (row.role === "admin") {
        stats.admins += 1;
      } else if (row.role === "authority") {
        if (row.authority_status === "approved") {
          stats.authoritiesApproved += 1;
        } else if (row.authority_status === "rejected") {
          stats.authoritiesRejected += 1;
        } else {
          stats.authoritiesPending += 1;
        }
      }

      return stats;
    },
    {
      citizens: 0,
      authoritiesPending: 0,
      authoritiesApproved: 0,
      authoritiesRejected: 0,
      admins: 0,
    }
  );
}
