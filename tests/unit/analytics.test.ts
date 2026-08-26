import { expect, test } from "vitest";

import {
  formatDurationHours,
  formatPercent,
  median,
  parseAnalyticsRange,
  rangeStartIso,
} from "@/lib/analytics/range";

test("unknown analytics ranges fall back to 30 days", () => {
  expect(parseAnalyticsRange()).toBe("30d");
  expect(parseAnalyticsRange("nope")).toBe("30d");
  expect(parseAnalyticsRange("7d")).toBe("7d");
});

test("all-time range does not invent a start date", () => {
  expect(rangeStartIso("all")).toBeNull();
});

test("bounded ranges are measured backward from now", () => {
  const now = new Date("2026-08-26T12:00:00.000Z");
  expect(rangeStartIso("7d", now)).toBe("2026-08-19T12:00:00.000Z");
});

test("empty metric sets stay empty instead of estimating", () => {
  expect(median([])).toBeNull();
  expect(formatPercent(3, 0)).toBeNull();
});

test("median uses real observed values only", () => {
  expect(median([2, 8, 4])).toBe(4);
  expect(median([2, 8, 4, 10])).toBe(6);
});

test("durations format from measured hours", () => {
  expect(formatDurationHours(0.25)).toBe("15 min");
  expect(formatDurationHours(3.2)).toBe("3.2 hr");
  expect(formatDurationHours(72)).toBe("3.0 days");
});
