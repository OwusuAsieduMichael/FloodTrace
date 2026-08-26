export const NOTIFICATION_TYPES = [
  "report_received",
  "report_verified",
  "authority_assigned",
  "incident_resolved",
  "report_rejected",
  "rainfall_warning",
  "new_report",
  "duplicate_detected",
  "high_priority",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  report_received: "Report received",
  report_verified: "Verified",
  authority_assigned: "Assigned",
  incident_resolved: "Resolved",
  report_rejected: "Rejected",
  rainfall_warning: "Rainfall warning",
  new_report: "New report",
  duplicate_detected: "Duplicate",
  high_priority: "High priority",
};

export const HEAVY_RAINFALL_MM = 10;
export const RAINFALL_WARNING_COOLDOWN_HOURS = 24;
