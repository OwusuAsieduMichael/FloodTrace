"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { insertNotifications, shortIncidentId } from "@/lib/notifications/dispatch";
import { rateLimit } from "@/lib/security/rate-limit";
import type { IncidentStatus } from "@/types";

const incidentIdSchema = z.string().uuid();
const MAX_NOTE_LENGTH = 2000;

export type AssignmentActionState = {
  error: string | null;
};

function revalidateAssignmentSurfaces(incidentId: string) {
  revalidatePath("/authority", "layout");
  revalidatePath("/citizen", "layout");
  revalidatePath("/authority/assignments");
  revalidatePath("/authority/response");
  revalidatePath("/authority/dashboard");
  revalidatePath("/authority/incidents");
  revalidatePath(`/authority/incidents/${incidentId}`);
  revalidatePath("/authority/map");
  revalidatePath("/authority/notifications");
  revalidatePath("/citizen/dashboard");
  revalidatePath("/citizen/reports");
  revalidatePath(`/citizen/reports/${incidentId}`);
  revalidatePath("/citizen/notifications");
  revalidatePath("/map");
}

async function requireApprovedAuthority() {
  const profile = await getCurrentProfile();

  if (
    !profile ||
    profile.role !== "authority" ||
    profile.authority_status !== "approved"
  ) {
    return null;
  }

  return profile;
}

export async function assignIncident(
  _prev: AssignmentActionState,
  formData: FormData
): Promise<AssignmentActionState> {
  const profile = await requireApprovedAuthority();

  if (!profile) {
    return { error: "You must be an approved authority to assign incidents." };
  }

  const limited = rateLimit(`assign:${profile.id}`, 30, 10 * 60_000);

  if (!limited.ok) {
    return { error: "Too many assignment attempts. Wait a moment and try again." };
  }

  const parsedIncidentId = incidentIdSchema.safeParse(formData.get("incidentId"));
  const parsedAssigneeId = incidentIdSchema.safeParse(formData.get("assigneeId"));

  if (!parsedIncidentId.success) {
    return { error: "This incident could not be found." };
  }

  if (!parsedAssigneeId.success) {
    return { error: "Choose an officer to assign." };
  }

  const notes = String(formData.get("notes") ?? "").trim();

  if (notes.length > MAX_NOTE_LENGTH) {
    return { error: `Notes must be ${MAX_NOTE_LENGTH} characters or fewer.` };
  }

  const supabase = await createClient();
  const { data: incident, error: loadError } = await supabase
    .from("incidents")
    .select("id, status, is_primary, assigned_to")
    .eq("id", parsedIncidentId.data)
    .maybeSingle();

  if (loadError || !incident) {
    return { error: "This incident could not be found." };
  }

  if (!incident.is_primary) {
    return {
      error: "Assign the primary incident. Supporting reports stay linked as evidence.",
    };
  }

  const status = incident.status as IncidentStatus;

  if (status !== "verified" && status !== "assigned") {
    return {
      error: "Only verified or already assigned incidents can be assigned.",
    };
  }

  if (incident.assigned_to === parsedAssigneeId.data && status === "assigned") {
    return { error: "This officer already owns the incident." };
  }

  const { data: assignee, error: assigneeError } = await supabase
    .from("profiles")
    .select("id, full_name, role, authority_status")
    .eq("id", parsedAssigneeId.data)
    .maybeSingle();

  if (
    assigneeError ||
    !assignee ||
    assignee.role !== "authority" ||
    assignee.authority_status !== "approved"
  ) {
    return { error: "Choose an approved authority officer." };
  }

  const storedNotes = notes.length > 0 ? notes : null;
  const isReassignment = status === "assigned";

  const { error: deactivateError } = await supabase
    .from("authority_assignments")
    .update({ is_active: false })
    .eq("incident_id", parsedIncidentId.data)
    .eq("is_active", true);

  if (deactivateError) {
    console.error("Failed to close previous assignment:", deactivateError);
    return { error: "The previous assignment could not be updated. Try again." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("incidents")
    .update({
      status: "assigned" satisfies IncidentStatus,
      assigned_to: parsedAssigneeId.data,
    })
    .eq("id", parsedIncidentId.data)
    .in("status", ["verified", "assigned"])
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    console.error("Failed to assign incident:", updateError);
    return {
      error: "The assignment could not be saved. The incident may have changed.",
    };
  }

  const { error: insertError } = await supabase.from("authority_assignments").insert({
    incident_id: parsedIncidentId.data,
    authority_id: parsedAssigneeId.data,
    assigned_by: profile.id,
    notes: storedNotes,
    is_active: true,
  });

  if (insertError) {
    console.error("Failed to record assignment:", insertError);
    return {
      error: "The officer was set on the incident, but the assignment record failed. Try again.",
    };
  }

  const shortId = shortIncidentId(parsedIncidentId.data);
  const assigneeName = assignee.full_name?.trim() || `officer ${shortId}`;

  if (parsedAssigneeId.data !== profile.id) {
    await insertNotifications([
      {
        userId: parsedAssigneeId.data,
        incidentId: parsedIncidentId.data,
        type: "authority_assigned",
        title: "Incident assigned to you",
        message: isReassignment
          ? `Incident ${shortId} was reassigned to you.`
          : `You are now responsible for incident ${shortId}.`,
      },
    ]);
  }

  if (isReassignment && incident.assigned_to && incident.assigned_to !== parsedAssigneeId.data) {
    await insertNotifications([
      {
        userId: incident.assigned_to,
        incidentId: parsedIncidentId.data,
        type: "authority_assigned",
        title: "Incident reassigned",
        message: `Incident ${shortId} was reassigned to ${assigneeName}.`,
      },
    ]);
  }

  revalidateAssignmentSurfaces(parsedIncidentId.data);
  redirect("/authority/assignments");
}
