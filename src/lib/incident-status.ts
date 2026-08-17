import type { IncidentStatus } from "@/types/domain";

export const STATUS_LABEL: Record<IncidentStatus, string> = {
  SUBMITTED: "Submitted",
  PENDING_REVIEW: "Pending review",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export const STATUS_VARIANT: Record<
  IncidentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SUBMITTED: "outline",
  PENDING_REVIEW: "secondary",
  VERIFIED: "default",
  ASSIGNED: "default",
  RESOLVED: "secondary",
  REJECTED: "destructive",
};

/** Non-terminal statuses in the order an incident normally progresses through. */
export const STATUS_LADDER = [
  "SUBMITTED",
  "PENDING_REVIEW",
  "VERIFIED",
  "ASSIGNED",
  "RESOLVED",
] as const satisfies readonly IncidentStatus[];
