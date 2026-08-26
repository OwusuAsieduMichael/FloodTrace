import type { IncidentStatus } from "@/types";

/** Primary incidents in these statuses can absorb nearby supporting reports. */
export const DUPLICATE_MATCH_STATUSES: IncidentStatus[] = [
  "submitted",
  "pending_review",
  "verified",
  "assigned",
];
