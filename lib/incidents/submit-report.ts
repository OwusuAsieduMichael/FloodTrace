"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth/session";
import { processDuplicateDetection } from "@/lib/duplicate-detection";
import { submitReportSchema } from "@/lib/incidents/submit-schema";
import { notifyReportSubmitted } from "@/lib/notifications";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { reverseGeocodePlaceName } from "@/lib/geo/reverse-geocode";

export type SubmitReportResult =
  | {
      success: true;
      incidentId: string;
      linkedToPrimary?: string;
    }
  | { success: false; error: string };

export async function submitIncidentReport(
  formData: FormData
): Promise<SubmitReportResult> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "citizen") {
    return { success: false, error: "You must be signed in as a citizen to report." };
  }

  const limited = rateLimit(`report:${profile.id}`, 8, 10 * 60_000);

  if (!limited.ok) {
    return {
      success: false,
      error: "Too many reports in a short time. Wait a few minutes and try again.",
    };
  }

  const photo = formData.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    return { success: false, error: "Camera evidence is required." };
  }

  const parsed = submitReportSchema.safeParse({
    incident_type: formData.get("incident_type"),
    severity: formData.get("severity"),
    description: formData.get("description"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    accuracy: formData.get("accuracy") || undefined,
    captured_at: formData.get("captured_at"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Report details are incomplete. Check location and try again.",
    };
  }

  const { incident_type, severity, description, latitude, longitude, captured_at } =
    parsed.data;

  const locationName = await reverseGeocodePlaceName(latitude, longitude);

  const supabase = await createClient();

  const { data: incident, error: incidentError } = await supabase
    .from("incidents")
    .insert({
      reporter_id: profile.id,
      incident_type,
      description,
      latitude,
      longitude,
      location_name: locationName,
      severity,
      captured_at,
      status: "submitted",
      is_primary: true,
    })
    .select("id")
    .single();

  if (incidentError || !incident) {
    return {
      success: false,
      error: "Unable to save your report. Please try again.",
    };
  }

  let uploadedStoragePath: string | null = null;

  try {
    const { storagePath, mediaUrl } = await uploadIncidentEvidence(supabase, {
      userId: profile.id,
      incidentId: incident.id,
      file: photo,
    });
    uploadedStoragePath = storagePath;

    const { error: mediaError } = await supabase.from("incident_media").insert({
      incident_id: incident.id,
      media_url: mediaUrl,
      media_type: "image",
      media_source: "citizen_evidence",
      captured_at,
      storage_path: storagePath,
    });

    if (mediaError) {
      await removeIncidentEvidence(supabase, storagePath);
      await supabase.from("incidents").delete().eq("id", incident.id);
      return {
        success: false,
        error: "Report saved but evidence upload failed. Please try again.",
      };
    }
  } catch (error) {
    if (uploadedStoragePath) {
      try {
        await removeIncidentEvidence(supabase, uploadedStoragePath);
      } catch {
        // Best-effort cleanup of orphaned storage objects.
      }
    }

    await supabase.from("incidents").delete().eq("id", incident.id);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Evidence upload failed. Please try again.",
    };
  }

  const duplicateResult = await processDuplicateDetection(supabase, {
    incidentId: incident.id,
    incidentType: incident_type,
    latitude,
    longitude,
    capturedAt: captured_at,
  });

  await notifyReportSubmitted({
    reporterId: profile.id,
    incidentId: incident.id,
    incidentType: incident_type,
    severity,
    linkedToPrimary: duplicateResult.linked
      ? duplicateResult.parentIncidentId
      : undefined,
  });

  revalidatePath("/citizen/dashboard");
  revalidatePath("/citizen/reports");
  revalidatePath("/citizen/notifications");
  revalidatePath("/authority/notifications");

  return {
    success: true,
    incidentId: incident.id,
    linkedToPrimary: duplicateResult.linked
      ? duplicateResult.parentIncidentId
      : undefined,
  };
}
