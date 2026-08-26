import { expect, test } from "vitest";

import {
  availableWorkflowActions,
  authorityWorkflowHref,
} from "@/lib/incidents/authority-href";
import { validateResolutionNotes } from "@/lib/incidents/resolution-notes";
import { PUBLIC_MAP_STATUSES } from "@/lib/incidents/constants";

test("submitted incidents can only be verified or rejected", () => {
  expect(availableWorkflowActions("submitted")).toEqual(["verify", "reject"]);
  expect(availableWorkflowActions("pending_review")).toEqual(["verify", "reject"]);
});

test("verification is required before assignment", () => {
  expect(availableWorkflowActions("verified")).toEqual(["assign"]);
  expect(availableWorkflowActions("assigned")).toEqual(["assign", "resolve"]);
});

test("resolved and rejected incidents have no further workflow actions", () => {
  expect(availableWorkflowActions("resolved")).toEqual([]);
  expect(availableWorkflowActions("rejected")).toEqual([]);
});

test("workflow links stay on the authority workspace", () => {
  expect(authorityWorkflowHref("verify", "abc")).toBe(
    "/authority/verification?incident=abc"
  );
  expect(authorityWorkflowHref("resolve", "abc")).toBe(
    "/authority/resolution?incident=abc"
  );
});

test("resolution notes must be at least 10 characters", () => {
  expect(validateResolutionNotes("too short").ok).toBe(false);
  expect(validateResolutionNotes("   padded   ").ok).toBe(false);

  const valid = validateResolutionNotes("  Drain cleared and photographed.  ");
  expect(valid.ok).toBe(true);
  if (valid.ok) {
    expect(valid.notes).toBe("Drain cleared and photographed.");
  }
});

test("the public map never includes unverified or rejected reports", () => {
  expect(PUBLIC_MAP_STATUSES).toEqual(["verified", "assigned", "resolved"]);
  expect(PUBLIC_MAP_STATUSES).not.toContain("submitted");
  expect(PUBLIC_MAP_STATUSES).not.toContain("rejected");
});
