import { PENDING_STATUSES } from "./constants";
import type { IncidentStatus } from "@/types";

export type AuthorityWorkflowAction = "verify" | "reject" | "assign" | "resolve";

export function authorityIncidentHref(incidentId: string): string {
  return `/authority/incidents/${incidentId}`;
}

export function authorityWorkflowHref(
  action: AuthorityWorkflowAction,
  incidentId: string
): string {
  const query = `incident=${encodeURIComponent(incidentId)}`;

  switch (action) {
    case "verify":
    case "reject":
      return `/authority/verification?${query}`;
    case "assign":
      return `/authority/assignments?${query}`;
    case "resolve":
      return `/authority/resolution?${query}`;
  }
}

export function availableWorkflowActions(
  status: IncidentStatus
): AuthorityWorkflowAction[] {
  if (PENDING_STATUSES.includes(status)) {
    return ["verify", "reject"];
  }

  if (status === "verified") {
    return ["assign"];
  }

  if (status === "assigned") {
    return ["assign", "resolve"];
  }

  return [];
}
