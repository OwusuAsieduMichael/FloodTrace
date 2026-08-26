"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/session";
import { PENDING_STATUSES } from "@/lib/incidents/constants";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { IncidentStatus } from "@/types";

const incidentIdSchema = z.string().uuid();

const MIN_REJECTION_NOTE_LENGTH = 10;
const MAX_NOTE_LENGTH = 2000;

export type VerificationActionState = {
  error: string | null;
};

function revalidateVerificationSurfaces(incidentId: string) {
  revalidatePath("/authority", "layout");
  revalidatePath("/citizen", "layout");
  revalidatePath("/authority/verification");
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

export async function beginIncidentReview(incidentId: string): Promise<void> {
  const parsedId = incidentIdSchema.safeParse(incidentId);

  if (!parsedId.success) {
    return;
  }

  const profile = await requireApprovedAuthority();

  if (!profile) {
    return;
  }

  const supabase = await createClient();
  const { data: incident } = await supabase
    .from("incidents")
    .select("id, status, is_primary")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (!incident || !incident.is_primary || incident.status !== "submitted") {
    return;
  }

  const { error } = await supabase
    .from("incidents")
    .update({ status: "pending_review" satisfies IncidentStatus })
    .eq("id", parsedId.data)
    .eq("status", "submitted");

  if (error) {
    console.error("Failed to begin incident review:", error);
    return;
  }

  revalidateVerificationSurfaces(parsedId.data);
}

export async function beginIncidentReviewAction(formData: FormData): Promise<void> {
  const parsedId = incidentIdSchema.safeParse(formData.get("incidentId"));

  if (!parsedId.success) {
    return;
  }

  await beginIncidentReview(parsedId.data);
}

export async function decideIncidentVerification(
  _prev: VerificationActionState,
  formData: FormData
): Promise<VerificationActionState> {
  const profile = await requireApprovedAuthority();

  if (!profile) {
    return { error: "You must be an approved authority to verify incidents." };
  }

  const limited = rateLimit(`verify:${profile.id}`, 30, 10 * 60_000);

  if (!limited.ok) {
    return { error: "Too many verification attempts. Wait a moment and try again." };
  }

  const parsedId = incidentIdSchema.safeParse(formData.get("incidentId"));

  if (!parsedId.success) {
    return { error: "This incident could not be found." };
  }

  const decision = formData.get("decision");

  if (decision !== "verify" && decision !== "reject") {
    return { error: "Choose verify or reject." };
  }

  const notes = String(formData.get("notes") ?? "").trim();

  if (notes.length > MAX_NOTE_LENGTH) {
    return { error: `Notes must be ${MAX_NOTE_LENGTH} characters or fewer.` };
  }

  if (decision === "reject" && notes.length < MIN_REJECTION_NOTE_LENGTH) {
    return {
      error: `Add a rejection reason of at least ${MIN_REJECTION_NOTE_LENGTH} characters. Citizens will see this feedback.`,
    };
  }

  const supabase = await createClient();
  const { data: incident, error: loadError } = await supabase
    .from("incidents")
    .select("id, status, is_primary, parent_incident_id")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (loadError || !incident) {
    return { error: "This incident could not be found." };
  }

  if (!incident.is_primary) {
    return {
      error: "Verify the primary incident. Supporting reports stay linked as evidence.",
    };
  }

  if (!PENDING_STATUSES.includes(incident.status as IncidentStatus)) {
    return {
      error: "This incident is no longer in the verification queue.",
    };
  }

  const nextStatus: IncidentStatus = decision === "verify" ? "verified" : "rejected";
  const storedNotes = notes.length > 0 ? notes : null;

  const { data: updated, error: updateError } = await supabase
    .from("incidents")
    .update({
      status: nextStatus,
      verification_notes: storedNotes,
      authority_feedback: storedNotes,
    })
    .eq("id", parsedId.data)
    .in("status", PENDING_STATUSES)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    console.error("Failed to update incident verification:", updateError);
    return {
      error: "The decision could not be saved. The incident may have already been reviewed.",
    };
  }

  revalidateVerificationSurfaces(parsedId.data);
  redirect("/authority/verification");
}
