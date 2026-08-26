import { expect, test } from "vitest";

import {
  formatRainMm,
  formatTemperatureC,
  formatWindMs,
  isValidCoordinate,
  parseWeatherLocationQuery,
  roundCoordinate,
} from "@/lib/weather";

test("coordinates must be finite and in range", () => {
  expect(isValidCoordinate(5.6, -0.18)).toBe(true);
  expect(isValidCoordinate(91, 0)).toBe(false);
  expect(isValidCoordinate(Number.NaN, 0)).toBe(false);
});

test("weather queries require both lat and lng together", () => {
  expect(parseWeatherLocationQuery(null, null)).toEqual({
    ok: true,
    mode: "default",
  });
  expect(parseWeatherLocationQuery("5.6", null)).toEqual({
    ok: false,
    reason: "incomplete_pair",
  });
  expect(parseWeatherLocationQuery("5.6", "-0.18")).toEqual({
    ok: true,
    mode: "coords",
    latitude: 5.6,
    longitude: -0.18,
  });
  expect(parseWeatherLocationQuery("not-a-number", "0")).toEqual({
    ok: false,
    reason: "invalid_location",
  });
});

test("weather formatting does not invent missing wind", () => {
  expect(formatWindMs(null)).toBe("Not reported");
  expect(formatWindMs(3.2)).toBe("3.2 m/s");
  expect(formatTemperatureC(27.4)).toBe("27°C");
  expect(formatRainMm(0)).toBe("0 mm");
  expect(roundCoordinate(5.60371)).toBe(5.604);
});
