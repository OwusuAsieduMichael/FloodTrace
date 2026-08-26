import type { IncidentStatus, IncidentType } from "@/types";

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  flood: "Flood",
  blocked_drain: "Blocked drain",
};

export const PENDING_STATUSES: IncidentStatus[] = ["submitted", "pending_review"];

export const IN_PROGRESS_STATUSES: IncidentStatus[] = ["verified", "assigned"];

export const TIMELINE_STATUSES: IncidentStatus[] = [
  "submitted",
  "pending_review",
  "verified",
  "assigned",
  "resolved",
];

export const TIMELINE_LABELS: Record<IncidentStatus, string> = {
  submitted: "Submitted",
  pending_review: "Pending review",
  verified: "Verified",
  assigned: "Assigned",
  resolved: "Resolved",
  rejected: "Rejected",
};

/** Statuses visible on the anonymous public map. */
export const PUBLIC_MAP_STATUSES: IncidentStatus[] = ["verified", "assigned", "resolved"];
