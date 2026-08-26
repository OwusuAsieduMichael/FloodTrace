import { expect, test } from "vitest";

import { getPostAuthRedirect, isAuthPath, isPublicPath } from "@/lib/auth/redirects";
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
