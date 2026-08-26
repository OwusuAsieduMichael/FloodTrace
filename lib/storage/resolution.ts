import type { SupabaseClient } from "@supabase/supabase-js";

import {
  IMAGE_SIZE_LIMITS,
  STORAGE_BUCKETS,
} from "./constants";
import { buildResolutionEvidencePath } from "./paths";
import {
  buildStorageUri,
  deleteStorageObject,
  getSignedStorageUrl,
} from "./signing";
import { extensionForMimeType, validateImageFile } from "./validation";

export async function uploadResolutionEvidence(
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
  const storagePath = buildResolutionEvidencePath(userId, incidentId, extension);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.RESOLUTION_EVIDENCE)
    .upload(storagePath, buffer, {
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Unable to upload resolution evidence. Please try again.");
  }

  const signedUrl = await getSignedStorageUrl(
    supabase,
    STORAGE_BUCKETS.RESOLUTION_EVIDENCE,
    storagePath
  );

  if (!signedUrl) {
    await deleteStorageObject(
      supabase,
      STORAGE_BUCKETS.RESOLUTION_EVIDENCE,
      storagePath
    );
    throw new Error("Resolution evidence uploaded but could not be verified.");
  }

  return {
    storagePath,
    mediaUrl: buildStorageUri(
      STORAGE_BUCKETS.RESOLUTION_EVIDENCE,
      storagePath
    ),
  };
}

export async function getSignedResolutionUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds?: number
): Promise<string | null> {
  return getSignedStorageUrl(
    supabase,
    STORAGE_BUCKETS.RESOLUTION_EVIDENCE,
    storagePath,
    expiresInSeconds
  );
}
