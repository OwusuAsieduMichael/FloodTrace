import { expect, test } from "vitest";

import {
  configuredEmergencyContacts,
  GHANA_EMERGENCY_CONTACTS,
  telHref,
} from "@/lib/config/emergency-contacts";

test("112 is the first Ghana emergency number", () => {
  expect(GHANA_EMERGENCY_CONTACTS[0]).toMatchObject({
    name: "National Emergency",
    phone: "112",
  });
  expect(GHANA_EMERGENCY_CONTACTS.map((contact) => contact.phone)).toEqual([
    "112",
    "18555",
    "192",
    "193",
    "0302 964 884",
  ]);
});

test("empty stored phones are treated as unconfigured", () => {
  expect(
    configuredEmergencyContacts([
      { name: "NADMO", phone: "", description: "Disaster management" },
    ])
  ).toEqual([]);
});

test("office numbers become dialable tel links", () => {
  expect(telHref("0302 964 884")).toBe("tel:0302964884");
  expect(telHref("112")).toBe("tel:112");
});
