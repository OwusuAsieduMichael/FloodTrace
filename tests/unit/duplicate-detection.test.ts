import { expect, test } from "vitest";

import {
  boundingBoxForRadius,
  distanceMeters,
  isWithinDuplicateTimeWindow,
  selectNearestDuplicateId,
  type DuplicateCandidate,
} from "@/lib/duplicate-detection";

const ACCRA = { latitude: 5.6037, longitude: -0.187 };

function candidate(
  id: string,
  latitude: number,
  longitude: number,
  submittedAt: string
): DuplicateCandidate {
  return {
    id,
    latitude,
    longitude,
    captured_at: submittedAt,
    submitted_at: submittedAt,
  };
}

test("distance between a point and itself is zero", () => {
  expect(
    distanceMeters(ACCRA.latitude, ACCRA.longitude, ACCRA.latitude, ACCRA.longitude)
  ).toBe(0);
});

test("150 m north is inside the default duplicate radius", () => {
  const north = ACCRA.latitude + 150 / 111_320;
  const distance = distanceMeters(
    ACCRA.latitude,
    ACCRA.longitude,
    north,
    ACCRA.longitude
  );

  expect(distance).toBeGreaterThan(140);
  expect(distance).toBeLessThan(160);
});

test("bounding box covers the requested radius", () => {
  const box = boundingBoxForRadius(ACCRA.latitude, ACCRA.longitude, 150);
  const north = ACCRA.latitude + 150 / 111_320;

  expect(north).toBeGreaterThan(box.minLatitude);
  expect(north).toBeLessThanOrEqual(box.maxLatitude);
});

test("nearest in-radius primary is selected; farther reports are ignored", () => {
  const nearbyLat = ACCRA.latitude + 50 / 111_320;
  const farLat = ACCRA.latitude + 400 / 111_320;

  expect(
    selectNearestDuplicateId(ACCRA.latitude, ACCRA.longitude, [
      candidate("far", farLat, ACCRA.longitude, "2026-08-26T10:00:00.000Z"),
      candidate("near", nearbyLat, ACCRA.longitude, "2026-08-26T10:01:00.000Z"),
    ], 150)
  ).toBe("near");
});

test("equal-distance ties keep the earlier submission", () => {
  const nearbyLat = ACCRA.latitude + 40 / 111_320;

  expect(
    selectNearestDuplicateId(ACCRA.latitude, ACCRA.longitude, [
      candidate("later", nearbyLat, ACCRA.longitude, "2026-08-26T10:05:00.000Z"),
      candidate("earlier", nearbyLat, ACCRA.longitude, "2026-08-26T10:00:00.000Z"),
    ], 150)
  ).toBe("earlier");
});

test("no match is returned when every candidate is outside the radius", () => {
  const farLat = ACCRA.latitude + 500 / 111_320;

  expect(
    selectNearestDuplicateId(ACCRA.latitude, ACCRA.longitude, [
      candidate("far", farLat, ACCRA.longitude, "2026-08-26T10:00:00.000Z"),
    ], 150)
  ).toBeNull();
});

test("duplicate time window is inclusive of the configured minutes", () => {
  expect(
    isWithinDuplicateTimeWindow(
      "2026-08-26T10:00:00.000Z",
      "2026-08-26T10:30:00.000Z",
      30
    )
  ).toBe(true);
  expect(
    isWithinDuplicateTimeWindow(
      "2026-08-26T10:00:00.000Z",
      "2026-08-26T10:31:00.000Z",
      30
    )
  ).toBe(false);
});
