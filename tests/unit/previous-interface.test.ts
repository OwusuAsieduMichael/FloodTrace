import { expect, test } from "vitest";

import { previousInterfacePath } from "@/lib/navigation/previous-interface";

test("same-origin referrers restore the previous interface", () => {
  expect(
    previousInterfacePath(
      "https://floodtrace.example/citizen/dashboard",
      "https://floodtrace.example",
      "/citizen/emergency"
    )
  ).toBe("/citizen/dashboard");
});

test("query strings on the previous interface are kept", () => {
  expect(
    previousInterfacePath(
      "https://floodtrace.example/authority/incidents/abc?from=queue",
      "https://floodtrace.example",
      "/authority/verification"
    )
  ).toBe("/authority/incidents/abc?from=queue");
});

test("off-site and missing referrers do not roll back", () => {
  expect(
    previousInterfacePath(
      "https://evil.example/citizen/dashboard",
      "https://floodtrace.example",
      "/citizen/emergency"
    )
  ).toBeNull();
  expect(
    previousInterfacePath(null, "https://floodtrace.example", "/citizen/emergency")
  ).toBeNull();
});

test("the current page is not treated as a previous interface", () => {
  expect(
    previousInterfacePath(
      "https://floodtrace.example/citizen/emergency",
      "https://floodtrace.example",
      "/citizen/emergency"
    )
  ).toBeNull();
});
