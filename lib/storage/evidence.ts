import type { SupabaseClient } from "@supabase/supabase-js";

import {
  IMAGE_SIZE_LIMITS,
  STORAGE_BUCKETS,
} from "./constants";
import { buildIncidentEvidencePath } from "./paths";
import {
  buildStorageUri,
  deleteStorageObject,
  getSignedStorageUrl,
} from "./signing";
import { extensionForMimeType, validateImageFile } from "./validation";

export async function uploadIncidentEvidence(
  supabase: SupabaseClient,
  params: {
    userId: string;
    incidentId: string;
    file: File;
  }
): Promise<{ storagePath: string; mediaUrl: string }> {
  const { userId, incidentId, file } = params;
  const validation = validateImageFile(file, IMAGE_SIZE_LIMITS.evidence);

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const extension = extensionForMimeType(validation.mimeType);
  const storagePath = buildIncidentEvidencePath(userId, incidentId, extension);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.INCIDENT_EVIDENCE)
    .upload(storagePath, buffer, {
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Unable to upload evidence. Please try again.");
  }

  const signedUrl = await getSignedStorageUrl(
    supabase,
    STORAGE_BUCKETS.INCIDENT_EVIDENCE,
    storagePath
  );

  if (!signedUrl) {
    await deleteStorageObject(
      supabase,
      STORAGE_BUCKETS.INCIDENT_EVIDENCE,
      storagePath
    );
    throw new Error("Evidence uploaded but could not be verified.");
  }

  return {
    storagePath,
    mediaUrl: buildStorageUri(STORAGE_BUCKETS.INCIDENT_EVIDENCE, storagePath),
  };
}

export async function getSignedEvidenceUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds?: number
): Promise<string | null> {
  return getSignedStorageUrl(
    supabase,
    STORAGE_BUCKETS.INCIDENT_EVIDENCE,
    storagePath,
    expiresInSeconds
  );
}

export async function removeIncidentEvidence(
  supabase: SupabaseClient,
  storagePath: string
): Promise<void> {
  return deleteStorageObject(
    supabase,
    STORAGE_BUCKETS.INCIDENT_EVIDENCE,
    storagePath
  );
}
