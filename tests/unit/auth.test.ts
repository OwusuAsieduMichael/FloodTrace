import { expect, test } from "vitest";

import { getPostAuthRedirect, isAuthPath, isPublicPath } from "@/lib/auth/redirects";
import {
  EMAIL_RESEND_COOLDOWN_SECONDS,
  formatCooldown,
  remainingCooldownSeconds,
} from "@/lib/auth/email-cooldown";
import {
  getPortalAccessRedirect,
  getProxyRedirect,
} from "@/lib/auth/session-redirect";
import { isSafeInternalPath, safePostLoginPath } from "@/lib/security/safe-path";

test("citizens land on the citizen dashboard", () => {
  expect(
    getPostAuthRedirect({ role: "citizen", authority_status: null })
  ).toBe("/citizen/dashboard");
});

test("approved authorities land on the authority dashboard", () => {
  expect(
    getPostAuthRedirect({ role: "authority", authority_status: "approved" })
  ).toBe("/authority/dashboard");
});

test("pending and rejected authorities stay on status pages", () => {
  expect(
    getPostAuthRedirect({ role: "authority", authority_status: "pending" })
  ).toBe("/authority/pending");
  expect(
    getPostAuthRedirect({ role: "authority", authority_status: "rejected" })
  ).toBe("/authority/rejected");
});

test("admins land on the admin dashboard", () => {
  expect(
    getPostAuthRedirect({ role: "admin", authority_status: null })
  ).toBe("/admin/dashboard");
});

test("login, map, and health routes are public", () => {
  expect(isPublicPath("/")).toBe(true);
  expect(isPublicPath("/map")).toBe(true);
  expect(isPublicPath("/auth/login")).toBe(true);
  expect(isPublicPath("/api/health")).toBe(true);
  expect(isPublicPath("/citizen/dashboard")).toBe(false);
  expect(isAuthPath("/auth/callback")).toBe(true);
});

test("open redirects are rejected", () => {
  expect(isSafeInternalPath("//evil.com")).toBe(false);
  expect(isSafeInternalPath("https://evil.com")).toBe(false);
  expect(isSafeInternalPath("/\\evil.com")).toBe(false);
  expect(isSafeInternalPath("/citizen/dashboard")).toBe(true);
});

test("post-login redirects stay inside the signed-in role", () => {
  const citizen = { role: "citizen" as const, authority_status: null };

  expect(safePostLoginPath("/citizen/reports", citizen)).toBe("/citizen/reports");
  expect(safePostLoginPath("/map", citizen)).toBe("/map");
  expect(safePostLoginPath("/admin/dashboard", citizen)).toBe("/citizen/dashboard");
  expect(safePostLoginPath("//evil.com", citizen)).toBe("/citizen/dashboard");

  const pending = { role: "authority" as const, authority_status: "pending" as const };
  expect(safePostLoginPath("/authority/dashboard", pending)).toBe("/authority/pending");
  expect(safePostLoginPath("/authority/pending", pending)).toBe("/authority/pending");
});

test("signed-in authorities are not bounced between login and the dashboard", () => {
  const approved = { role: "authority" as const, authority_status: "approved" as const };
  const pending = { role: "authority" as const, authority_status: "pending" as const };

  expect(getProxyRedirect("/auth/login", true, approved)).toBe("/authority/dashboard");
  expect(getProxyRedirect("/authority/dashboard", true, approved)).toBeNull();
  expect(getProxyRedirect("/authority/pending", true, approved)).toBe(
    "/authority/dashboard"
  );

  expect(getProxyRedirect("/authority/dashboard", true, pending)).toBe(
    "/authority/pending"
  );
  expect(getProxyRedirect("/authority/pending", true, pending)).toBeNull();

  expect(getPortalAccessRedirect("authority", true, approved)).toBeNull();
  expect(getPortalAccessRedirect("authority", false, null)).toBe("/auth/login");
});

test("a session without a profile does not loop on login", () => {
  expect(getProxyRedirect("/auth/login", true, null)).toBeNull();
  expect(getProxyRedirect("/authority/dashboard", true, null)).toBe("/");
  expect(getPortalAccessRedirect("authority", true, null)).toBe("/");
});

test("confirmation emails wait a full minute before another send", () => {
  const sentAt = 1_000_000;

  expect(remainingCooldownSeconds(sentAt, sentAt)).toBe(
    EMAIL_RESEND_COOLDOWN_SECONDS
  );
  expect(remainingCooldownSeconds(sentAt, sentAt + 15_000)).toBe(45);
  expect(remainingCooldownSeconds(sentAt, sentAt + 60_000)).toBe(0);
  expect(remainingCooldownSeconds(sentAt, sentAt + 90_000)).toBe(0);
  expect(formatCooldown(45)).toBe("0:45");
  expect(formatCooldown(60)).toBe("1:00");
});
