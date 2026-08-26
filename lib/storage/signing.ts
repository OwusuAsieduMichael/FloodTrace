import type { SupabaseClient } from "@supabase/supabase-js";

import {
  SIGNED_URL_TTL_SECONDS,
  STORAGE_BUCKETS,
  STORAGE_URI_PREFIX,
  type StorageBucket,
} from "./constants";
import type { MediaSource } from "@/types";

export function buildStorageUri(bucket: StorageBucket, path: string): string {
  return `${STORAGE_URI_PREFIX}${bucket}:${path}`;
}

export function parseStorageUri(
  value: string
): { bucket: StorageBucket; path: string } | null {
  if (!value.startsWith(STORAGE_URI_PREFIX)) {
    return null;
  }

  const rest = value.slice(STORAGE_URI_PREFIX.length);
  const separator = rest.indexOf(":");

  if (separator === -1) {
    return null;
  }

  const bucket = rest.slice(0, separator);
  const path = rest.slice(separator + 1);

  if (
    bucket !== STORAGE_BUCKETS.INCIDENT_EVIDENCE &&
    bucket !== STORAGE_BUCKETS.RESOLUTION_EVIDENCE &&
    bucket !== STORAGE_BUCKETS.AVATARS
  ) {
    return null;
  }

  return { bucket, path };
}

export function bucketForMediaSource(source: MediaSource): StorageBucket {
  return source === "citizen_evidence"
    ? STORAGE_BUCKETS.INCIDENT_EVIDENCE
    : STORAGE_BUCKETS.RESOLUTION_EVIDENCE;
}

export async function getSignedStorageUrl(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  storagePath: string,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function getSignedStorageUrls(
  supabase: SupabaseClient,
  items: Array<{ bucket: StorageBucket; path: string }>,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS
): Promise<Array<string | null>> {
  return Promise.all(
    items.map((item) =>
      getSignedStorageUrl(supabase, item.bucket, item.path, expiresInSeconds)
    )
  );
}

export async function resolveMediaDisplayUrl(
  supabase: SupabaseClient,
  params: {
    mediaUrl: string;
    storagePath: string;
    mediaSource: MediaSource;
  }
): Promise<string | null> {
  const parsed = parseStorageUri(params.mediaUrl);

  if (parsed) {
    return getSignedStorageUrl(supabase, parsed.bucket, parsed.path);
  }

  const bucket = bucketForMediaSource(params.mediaSource);
  const signedFromPath = await getSignedStorageUrl(
    supabase,
    bucket,
    params.storagePath
  );

  if (signedFromPath) {
    return signedFromPath;
  }

  if (params.mediaUrl.startsWith("http")) {
    return params.mediaUrl;
  }

  return null;
}

export async function deleteStorageObject(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  storagePath: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);

  if (error) {
    throw new Error("Unable to remove uploaded file.");
  }
}
