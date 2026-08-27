import { expect, test } from "vitest";

import { formatPlaceName } from "@/lib/geo/place-name";
import { formatIncidentLocation } from "@/lib/incidents/format";

test("formats a Ghana street address without repeating Accra or adding Ghana", () => {
  expect(
    formatPlaceName({
      road: "Oxford Street",
      suburb: "Osu",
      city: "Accra",
      state: "Greater Accra",
      country: "Ghana",
    })
  ).toBe("Oxford Street, Osu, Accra, Greater Accra");
});

test("drops duplicate city/state labels", () => {
  expect(
    formatPlaceName({
      city: "Accra",
      town: "Accra",
      state: "Accra",
      country: "Ghana",
    })
  ).toBe("Accra");
});

test("keeps country when the report is outside Ghana", () => {
  expect(
    formatPlaceName({
      city: "Lome",
      country: "Togo",
    })
  ).toBe("Lome, Togo");
});

test("falls back to the first segments of a long display name", () => {
  expect(
    formatPlaceName(
      {},
      "Independence Avenue, Ridge, Accra, Greater Accra Region, Ghana"
    )
  ).toBe("Independence Avenue, Ridge, Accra");
});

test("includes house numbers on street labels", () => {
  expect(
    formatPlaceName({
      houseNumber: "19",
      road: "Patrice Lumumba Road",
      suburb: "Airport Residential Area",
      city: "Accra",
      country: "Ghana",
    })
  ).toBe("19 Patrice Lumumba Road, Airport Residential Area, Accra");
});

test("incident location prefers the place name and never shows raw coordinates", () => {
  expect(formatIncidentLocation("Osu, Accra", 5.55, -0.18)).toBe("Osu, Accra");
  expect(formatIncidentLocation(null, 5.60371, -0.187)).toBe("Unknown area");
  expect(formatIncidentLocation("  ")).toBe("Unknown area");
});
