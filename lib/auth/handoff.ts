import { isAuthPath } from "@/lib/auth/redirects";
import { isSafeInternalPath } from "@/lib/security/safe-path";

export const AUTH_CONTINUE_PATH = "/auth/continue";

export function isAuthHandoffPath(pathname: string) {
  return (
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/reset-password") ||
    pathname.startsWith("/auth/continue")
  );
}

/** After sign-in, always land here so cookies and the profile row can settle. */
export function authContinuePath(next?: string | null): string {
  if (isSafeInternalPath(next) && !isAuthPath(next)) {
    return `${AUTH_CONTINUE_PATH}?next=${encodeURIComponent(next)}`;
  }

  return AUTH_CONTINUE_PATH;
}
