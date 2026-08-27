import type { AuthorityStatus, UserRole } from "@/types";

export interface AuthProfile {
  role: UserRole;
  authority_status: AuthorityStatus | null;
}

export function getPostAuthRedirect(profile: AuthProfile): string {
  switch (profile.role) {
    case "citizen":
      return "/citizen/dashboard";
    case "authority":
      if (profile.authority_status === "approved") {
        return "/authority/dashboard";
      }
      if (profile.authority_status === "rejected") {
        return "/authority/rejected";
      }
      return "/authority/pending";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/citizen/dashboard";
  }
}

export const PUBLIC_PATHS = [
  "/",
  "/map",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/continue",
] as const;

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) {
    return true;
  }

  return (
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/continue")
  );
}

export function isAuthPath(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}
