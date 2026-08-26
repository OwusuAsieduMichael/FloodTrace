export const STORAGE_BUCKETS = {
  INCIDENT_EVIDENCE: "incident-evidence",
  RESOLUTION_EVIDENCE: "resolution-evidence",
  AVATARS: "avatars",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const IMAGE_SIZE_LIMITS = {
  evidence: 10 * 1024 * 1024,
  avatar: 2 * 1024 * 1024,
} as const;

export const SIGNED_URL_TTL_SECONDS = 60 * 60;

export const STORAGE_URI_PREFIX = "storage:";
