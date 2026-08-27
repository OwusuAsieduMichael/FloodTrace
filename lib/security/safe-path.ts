import type { AuthProfile } from "@/lib/auth/redirects";
import { getPostAuthRedirect, isAuthPath } from "@/lib/auth/redirects";

/** Relative app paths only. Blocks protocol-relative and off-site redirects. */
export function isSafeInternalPath(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return false;
  }

  if (value.includes("\\") || value.includes("://") || /[\s]/.test(value)) {
    return false;
  }

  try {
    const parsed = new URL(value, "https://floodtrace.invalid");
    return parsed.origin === "https://floodtrace.invalid" && parsed.pathname.startsWith("/");
  } catch {
    return false;
  }
}

export function safePostLoginPath(
  requested: string | null | undefined,
  profile: AuthProfile
): string {
  const fallback = getPostAuthRedirect(profile);

  if (!isSafeInternalPath(requested)) {
    return fallback;
  }

  if (isAuthPath(requested)) {
    return fallback;
  }

  switch (profile.role) {
    case "citizen":
      return requested.startsWith("/citizen") || requested === "/map"
        ? requested
        : fallback;
    case "admin":
      return requested.startsWith("/admin") ? requested : fallback;
    case "authority": {
      if (!requested.startsWith("/authority")) {
        return fallback;
      }

      if (profile.authority_status === "pending") {
        return requested.startsWith("/authority/pending")
          ? requested
          : "/authority/pending";
      }

      if (profile.authority_status === "rejected") {
        return requested.startsWith("/authority/rejected")
          ? requested
          : "/authority/rejected";
      }

      return requested;
    }
    default:
      return fallback;
  }
}
