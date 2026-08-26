import { expect, test } from "vitest";

import { submitReportSchema } from "@/lib/incidents/submit-schema";
import { validateImageFile } from "@/lib/storage/validation";
import { IMAGE_SIZE_LIMITS } from "@/lib/storage/constants";
import { buildIncidentEvidencePath } from "@/lib/storage/paths";

test("accepts a live GPS capture with a timestamp", () => {
  const parsed = submitReportSchema.safeParse({
    incident_type: "flood",
    severity: "high",
    description: "  Water over the road  ",
    latitude: "5.6037",
    longitude: "-0.187",
    accuracy: "12",
    captured_at: "2026-08-26T10:15:00.000Z",
  });

  expect(parsed.success).toBe(true);
  if (parsed.success) {
    expect(parsed.data.description).toBe("Water over the road");
    expect(parsed.data.latitude).toBeCloseTo(5.6037);
    expect(parsed.data.longitude).toBeCloseTo(-0.187);
  }
});

test("rejects fabricated or incomplete location payloads", () => {
  expect(
    submitReportSchema.safeParse({
      incident_type: "flood",
      severity: "low",
      latitude: "91",
      longitude: "0",
      captured_at: "2026-08-26T10:15:00.000Z",
    }).success
  ).toBe(false);

  expect(
    submitReportSchema.safeParse({
      incident_type: "flood",
      severity: "low",
      latitude: "5.6",
      longitude: "-0.18",
      captured_at: "not-a-timestamp",
    }).success
  ).toBe(false);
});

test("rejects gallery-style files that are not allowed images", () => {
  const pdf = new File(["%PDF"], "notes.pdf", { type: "application/pdf" });
  const result = validateImageFile(pdf, IMAGE_SIZE_LIMITS.evidence);

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error).toMatch(/JPEG, PNG, or WebP/i);
  }
});

test("rejects oversized evidence", () => {
  const bytes = new Uint8Array(IMAGE_SIZE_LIMITS.evidence + 1);
  const file = new File([bytes], "flood.jpg", { type: "image/jpeg" });
  const result = validateImageFile(file, IMAGE_SIZE_LIMITS.evidence);

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error).toMatch(/10 MB/i);
  }
});

test("evidence paths stay scoped to the reporter and incident", () => {
  expect(buildIncidentEvidencePath("user-1", "incident-9", "jpg")).toMatch(
    /^user-1\/incident-9\/\d+\.jpg$/
  );
});
