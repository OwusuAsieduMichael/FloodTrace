import {
  getPostAuthRedirect,
  isAuthPath,
  type AuthProfile,
} from "@/lib/auth/redirects";
import type { UserRole } from "@/types";

export function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/citizen") ||
    pathname.startsWith("/authority") ||
    pathname.startsWith("/admin")
  );
}

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function redirectUnlessCurrent(pathname: string, destination: string): string | null {
  if (normalizePath(pathname) === normalizePath(destination)) {
    return null;
  }

  return destination;
}

/**
 * Decide where the session proxy should send this request, or `null` to continue.
 * Never returns the current path — that is what produced ERR_TOO_MANY_REDIRECTS
 * after a successful Authority sign-in.
 */
export function getProxyRedirect(
  pathname: string,
  hasUser: boolean,
  profile: AuthProfile | null
): string | null {
  const isCallback = pathname.startsWith("/auth/callback");
  const isResetPassword = pathname.startsWith("/auth/reset-password");

  if (!hasUser) {
    if (isProtectedPath(pathname)) {
      return "/auth/login";
    }

    return null;
  }

  if (isCallback || isResetPassword) {
    return null;
  }

  if (!profile) {
    // Signed in, but the profile row could not be loaded. Sending this
    // request to /auth/login loops: the proxy sees a session and bounces
    // back, while layouts used to bounce to login.
    if (isProtectedPath(pathname)) {
      return redirectUnlessCurrent(pathname, "/");
    }

    return null;
  }

  const homePath = getPostAuthRedirect(profile);

  if (isAuthPath(pathname)) {
    return redirectUnlessCurrent(pathname, homePath);
  }

  if (!isProtectedPath(pathname)) {
    return null;
  }

  const { role, authority_status: authorityStatus } = profile;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return redirectUnlessCurrent(pathname, homePath);
  }

  if (pathname.startsWith("/citizen") && role !== "citizen") {
    return redirectUnlessCurrent(pathname, homePath);
  }

  if (pathname.startsWith("/authority")) {
    if (role !== "authority" && role !== "admin") {
      return redirectUnlessCurrent(pathname, homePath);
    }

    if (role === "admin") {
      return redirectUnlessCurrent(pathname, "/admin/dashboard");
    }

    const isPendingPage = pathname.startsWith("/authority/pending");
    const isRejectedPage = pathname.startsWith("/authority/rejected");
    const isDashboard = pathname.startsWith("/authority/dashboard");

    if (authorityStatus === "pending" && !isPendingPage) {
      return redirectUnlessCurrent(pathname, "/authority/pending");
    }

    if (authorityStatus === "rejected" && !isRejectedPage) {
      return redirectUnlessCurrent(pathname, "/authority/rejected");
    }

    if (authorityStatus === "approved" && (isPendingPage || isRejectedPage)) {
      return redirectUnlessCurrent(pathname, "/authority/dashboard");
    }

    if (isDashboard && authorityStatus !== "approved") {
      return redirectUnlessCurrent(pathname, homePath);
    }
  }

  return null;
}

/** Layout-side guard: never send a signed-in user back to /auth/login. */
export function getPortalAccessRedirect(
  expectedRole: UserRole,
  hasUser: boolean,
  profile: AuthProfile | null
): string | null {
  if (!hasUser) {
    return "/auth/login";
  }

  if (!profile) {
    return "/";
  }

  if (profile.role !== expectedRole) {
    return getPostAuthRedirect(profile);
  }

  return null;
}
