import { isSafeInternalPath } from "@/lib/security/safe-path";

/** Same-origin FloodTrace path to restore, or null when history should not be used. */
export function previousInterfacePath(
  referrer: string | null | undefined,
  currentOrigin: string,
  currentPathname: string
): string | null {
  if (!referrer) {
    return null;
  }

  try {
    const url = new URL(referrer);

    if (url.origin !== currentOrigin) {
      return null;
    }

    const path = `${url.pathname}${url.search}`;

    if (url.pathname === currentPathname || !isSafeInternalPath(path)) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}
