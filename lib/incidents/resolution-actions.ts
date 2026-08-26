"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/session";
import { validateResolutionNotes } from "@/lib/incidents/resolution-notes";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  removeResolutionEvidence,
  uploadResolutionEvidence,
} from "@/lib/storage";
import type { IncidentStatus } from "@/types";

const incidentIdSchema = z.string().uuid();
const capturedAtSchema = z.string().datetime();

export type ResolutionActionState = {
  error: string | null;
};

function revalidateResolutionSurfaces(incidentId: string) {
  revalidatePath("/authority", "layout");
  revalidatePath("/citizen", "layout");
  revalidatePath("/authority/resolution");
  revalidatePath("/authority/response");
  revalidatePath("/authority/assignments");
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

async function markIncidentResolved(
  supabase: Awaited<ReturnType<typeof createClient>>,
  incidentId: string
) {
  return supabase
    .from("incidents")
    .update({ status: "resolved" satisfies IncidentStatus })
    .eq("id", incidentId)
    .eq("status", "assigned")
    .select("id")
    .maybeSingle();
}

export async function resolveIncident(
  _prev: ResolutionActionState,
  formData: FormData
): Promise<ResolutionActionState> {
  const profile = await requireApprovedAuthority();

  if (!profile) {
    return { error: "You must be an approved authority to resolve incidents." };
  }

  const limited = rateLimit(`resolve:${profile.id}`, 20, 10 * 60_000);

  if (!limited.ok) {
    return { error: "Too many resolution attempts. Wait a moment and try again." };
  }

  const parsedId = incidentIdSchema.safeParse(formData.get("incidentId"));

  if (!parsedId.success) {
    return { error: "This incident could not be found." };
  }

  const notes = validateResolutionNotes(String(formData.get("description") ?? ""));

  if (!notes.ok) {
    return { error: notes.error };
  }

  const description = notes.notes;

  const supabase = await createClient();
  const { data: incident, error: loadError } = await supabase
    .from("incidents")
    .select("id, status, is_primary")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (loadError || !incident) {
    return { error: "This incident could not be found." };
  }

  if (!incident.is_primary) {
    return {
      error: "Resolve the primary incident. Supporting reports stay linked as evidence.",
    };
  }

  if (incident.status === "resolved") {
    return { error: "This incident is already resolved." };
  }

  if (incident.status !== "assigned") {
    return {
      error: "Assign a response officer before documenting resolution.",
    };
  }

  const { data: existingRecord } = await supabase
    .from("resolution_records")
    .select("id")
    .eq("incident_id", parsedId.data)
    .maybeSingle();

  if (existingRecord) {
    const { data: updated, error: updateError } = await markIncidentResolved(
      supabase,
      parsedId.data
    );

    if (updateError || !updated) {
      console.error("Failed to close previously documented incident:", updateError);
      return {
        error: "Resolution evidence is on file, but the incident could not be marked resolved.",
      };
    }

    revalidateResolutionSurfaces(parsedId.data);
    redirect("/authority/resolution");
  }

  const photo = formData.get("afterPhoto");

  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "An after photograph is required. Capture live camera evidence of completed work." };
  }

  const parsedCapturedAt = capturedAtSchema.safeParse(formData.get("capturedAt"));
  const capturedAt = parsedCapturedAt.success
    ? parsedCapturedAt.data
    : new Date().toISOString();

  const { data: beforeMedia, error: beforeError } = await supabase
    .from("incident_media")
    .select("id")
    .eq("incident_id", parsedId.data)
    .eq("media_source", "citizen_evidence")
    .order("uploaded_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (beforeError || !beforeMedia) {
    return {
      error: "Citizen evidence is required as the before photograph. This incident has none on file.",
    };
  }

  let uploadedStoragePath: string | null = null;

  try {
    const { storagePath, mediaUrl } = await uploadResolutionEvidence(supabase, {
      userId: profile.id,
      incidentId: parsedId.data,
      file: photo,
    });
    uploadedStoragePath = storagePath;

    const { data: afterMedia, error: mediaError } = await supabase
      .from("incident_media")
      .insert({
        incident_id: parsedId.data,
        media_url: mediaUrl,
        media_type: "image",
        media_source: "authority_resolution",
        captured_at: capturedAt,
        storage_path: storagePath,
      })
      .select("id")
      .single();

    if (mediaError || !afterMedia) {
      throw new Error("Unable to save the after photograph. Please try again.");
    }

    const { error: recordError } = await supabase.from("resolution_records").insert({
      incident_id: parsedId.data,
      authority_id: profile.id,
      description,
      before_media_id: beforeMedia.id,
      after_media_id: afterMedia.id,
    });

    if (recordError) {
      console.error("Failed to insert resolution record:", recordError);
      throw new Error("Unable to save the resolution record. Please try again.");
    }

    const { data: updated, error: updateError } = await markIncidentResolved(
      supabase,
      parsedId.data
    );

    if (updateError || !updated) {
      console.error("Failed to mark incident resolved:", updateError);
      return {
        error:
          "Resolution evidence was saved, but the incident status could not be updated. Try submitting again.",
      };
    }
  } catch (error) {
    if (uploadedStoragePath) {
      try {
        await removeResolutionEvidence(supabase, uploadedStoragePath);
      } catch {
        // Resolution storage is append-only; leftover objects are harmless.
      }
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Resolution could not be saved. Please try again.",
    };
  }

  revalidateResolutionSurfaces(parsedId.data);
  redirect("/authority/resolution");
}
