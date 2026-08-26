import type { SupabaseClient } from "@supabase/supabase-js";

import { IMAGE_SIZE_LIMITS, STORAGE_BUCKETS } from "./constants";
import { buildAvatarPath } from "./paths";
import { extensionForMimeType, validateImageFile } from "./validation";

export async function uploadAvatar(
  supabase: SupabaseClient,
  params: {
    userId: string;
    file: File;
  }
): Promise<{ storagePath: string; publicUrl: string }> {
  const { userId, file } = params;
  const validation = validateImageFile(file, IMAGE_SIZE_LIMITS.avatar);

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const extension = extensionForMimeType(validation.mimeType);
  const storagePath = buildAvatarPath(userId, extension);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(storagePath, buffer, {
      contentType: validation.mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error("Unable to upload avatar. Please try again.");
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error("Avatar uploaded but could not be resolved.");
  }

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

export function getAvatarPublicUrl(
  supabase: SupabaseClient,
  storagePath: string
): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
