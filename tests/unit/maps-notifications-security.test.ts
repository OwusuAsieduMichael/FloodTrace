import { expect, test } from "vitest";

import { getIncidentMapBounds, getMapCenter } from "@/lib/maps/bounds";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/constants";
import { notificationHref } from "@/lib/notifications/href";
import { summarizeOfflineQueue } from "@/lib/offline";
import { clientIpFromHeaders, rateLimit } from "@/lib/security/rate-limit";
import type { PendingReportRecord } from "@/lib/offline/types";

test("empty maps fall back to Accra instead of fabricating incidents", () => {
  expect(getIncidentMapBounds([])).toBeNull();
  expect(getMapCenter([])).toEqual([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]);
});

test("map bounds fit the reported coordinates", () => {
  const bounds = getIncidentMapBounds([
    { latitude: 5.6, longitude: -0.2 },
    { latitude: 5.7, longitude: -0.1 },
  ]);

  expect(bounds).toEqual([
    [5.6, -0.2],
    [5.7, -0.1],
  ]);
});

test("citizen notifications open the related report", () => {
  expect(notificationHref("report_verified", "inc-1", "citizen")).toBe(
    "/citizen/reports/inc-1"
  );
  expect(notificationHref("rainfall_warning", null, "citizen")).toBe(
    "/citizen/weather"
  );
  expect(notificationHref("new_report", "inc-1", "authority")).toBe(
    "/authority/incidents"
  );
});

test("offline queue summary counts real pending records only", () => {
  const base = {
    incident_type: "flood" as const,
    severity: "medium" as const,
    description: null,
    latitude: 5.6,
    longitude: -0.18,
    accuracy: 10,
    captured_at: "2026-08-26T10:00:00.000Z",
    photo_blob: new Blob(),
    photo_mime_type: "image/jpeg",
    photo_file_name: "capture.jpg",
    error_message: null,
    created_at: "2026-08-26T10:00:00.000Z",
    updated_at: "2026-08-26T10:00:00.000Z",
  };

  const reports: PendingReportRecord[] = [
    { ...base, id: "1", status: "pending" },
    { ...base, id: "2", status: "syncing" },
    { ...base, id: "3", status: "failed" },
  ];

  expect(summarizeOfflineQueue(reports)).toEqual({
    pending: 1,
    syncing: 1,
    failed: 1,
    total: 3,
  });
  expect(summarizeOfflineQueue([])).toEqual({
    pending: 0,
    syncing: 0,
    failed: 0,
    total: 0,
  });
});

test("rate limits reject extra attempts inside the window", () => {
  const key = `test:${crypto.randomUUID()}`;

  expect(rateLimit(key, 2, 60_000).ok).toBe(true);
  expect(rateLimit(key, 2, 60_000).ok).toBe(true);

  const blocked = rateLimit(key, 2, 60_000);
  expect(blocked.ok).toBe(false);
  if (!blocked.ok) {
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  }
});

test("forwarded client IPs use the first address", () => {
  const headers = new Headers({
    "x-forwarded-for": " 1.1.1.1, 2.2.2.2",
  });

  expect(clientIpFromHeaders(headers)).toBe("1.1.1.1");
});
