import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
} from "./constants";

export function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export function validateImageFile(
  file: File,
  maxBytes: number
): { ok: true; mimeType: AllowedImageMimeType } | { ok: false; error: string } {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)
  ) {
    return {
      ok: false,
      error: "Image must be JPEG, PNG, or WebP.",
    };
  }

  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return {
      ok: false,
      error: `Image must be ${maxMb} MB or smaller.`,
    };
  }

  return { ok: true, mimeType: file.type as AllowedImageMimeType };
}
