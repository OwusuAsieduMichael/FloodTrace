import { createClient } from "@/lib/supabase/server";
import type { AuthorityAssignment } from "@/types";

export interface AssignableStaff {
  id: string;
  full_name: string | null;
}

export interface AssignmentRecord extends AuthorityAssignment {
  assignee_name: string | null;
  assigned_by_name: string | null;
}

export async function getAssignableStaff(): Promise<AssignableStaff[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "authority")
    .eq("authority_status", "approved")
    .order("full_name", { ascending: true });

  if (error || !data) {
    console.error("Failed to load assignable staff:", error);
    return [];
  }

  return data;
}

export function staffDisplayName(staff: AssignableStaff): string {
  return staff.full_name?.trim() || `Officer ${staff.id.slice(0, 8).toUpperCase()}`;
}

export async function getIncidentAssignments(
  incidentId: string
): Promise<AssignmentRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("authority_assignments")
    .select("id, incident_id, authority_id, assigned_by, notes, is_active, assigned_at, created_at")
    .eq("incident_id", incidentId)
    .order("assigned_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const nameIds = data.flatMap((row) => [row.authority_id, row.assigned_by]);
  const names = await loadNames(nameIds);

  return data.map((row) => ({
    ...(row as AuthorityAssignment),
    assignee_name: names.get(row.authority_id) ?? null,
    assigned_by_name: row.assigned_by ? (names.get(row.assigned_by) ?? null) : null,
  }));
}

export async function getActiveAssignments(
  incidentIds: string[]
): Promise<Map<string, AssignmentRecord>> {
  const results = new Map<string, AssignmentRecord>();

  if (incidentIds.length === 0) {
    return results;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("authority_assignments")
    .select("id, incident_id, authority_id, assigned_by, notes, is_active, assigned_at, created_at")
    .in("incident_id", incidentIds)
    .eq("is_active", true);

  if (error || !data) {
    return results;
  }

  const names = await loadNames(data.flatMap((row) => [row.authority_id, row.assigned_by]));

  for (const row of data) {
    results.set(row.incident_id, {
      ...(row as AuthorityAssignment),
      assignee_name: names.get(row.authority_id) ?? null,
      assigned_by_name: row.assigned_by ? (names.get(row.assigned_by) ?? null) : null,
    });
  }

  return results;
}

async function loadNames(ids: Array<string | null>): Promise<Map<string, string | null>> {
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
