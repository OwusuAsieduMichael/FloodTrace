import { Badge } from "@/components/ui/badge";
import type { IncidentSeverity, IncidentStatus } from "@/types";

const severityLabels: Record<IncidentSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const severityVariants: Record<
  IncidentSeverity,
  "critical" | "high" | "medium" | "low"
> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <Badge variant={severityVariants[severity]}>{severityLabels[severity]}</Badge>
  );
}

const statusLabels: Record<IncidentStatus, string> = {
  submitted: "Submitted",
  pending_review: "Pending review",
  verified: "Verified",
  assigned: "Assigned",
  resolved: "Resolved",
  rejected: "Rejected",
};

const statusVariants: Record<
  IncidentStatus,
  "default" | "secondary" | "success" | "destructive" | "outline"
> = {
  submitted: "secondary",
  pending_review: "medium" as "secondary",
  verified: "success",
  assigned: "default",
  resolved: "success",
  rejected: "destructive",
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const variant = statusVariants[status];

  if (status === "pending_review") {
    return <Badge variant="medium">{statusLabels[status]}</Badge>;
  }

  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}
