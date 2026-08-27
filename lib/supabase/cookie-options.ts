/** Shared cookie flags so browser, server, and proxy clients persist the same session. */
export function supabaseCookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
