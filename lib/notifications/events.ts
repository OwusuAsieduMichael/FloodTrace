import { INCIDENT_TYPE_LABELS } from "@/lib/incidents/constants";
import type { IncidentSeverity, IncidentType } from "@/types";

import {
  insertNotifications,
  getOperationalStaffIds,
  shortIncidentId,
  type NotificationDraft,
} from "./dispatch";

export async function notifyReportSubmitted(input: {
  reporterId: string;
  incidentId: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  linkedToPrimary?: string;
}): Promise<void> {
  const shortId = shortIncidentId(input.incidentId);
  const typeLabel = INCIDENT_TYPE_LABELS[input.incidentType].toLowerCase();
  const staffIds = await getOperationalStaffIds();

  const drafts: NotificationDraft[] = [
    {
      userId: input.reporterId,
      incidentId: input.incidentId,
      type: "report_received",
      title: "Report received",
      message: `Your ${typeLabel} report ${shortId} was submitted and is awaiting review.`,
    },
    ...staffIds.map((userId) => ({
      userId,
      incidentId: input.incidentId,
      type: "new_report" as const,
      title: "New incident reported",
      message: `A new ${typeLabel} report (${shortId}) needs attention.`,
    })),
  ];

  if (input.severity === "high" || input.severity === "critical") {
    drafts.push(
      ...staffIds.map((userId) => ({
        userId,
        incidentId: input.incidentId,
        type: "high_priority" as const,
        title: "High-priority incident",
        message: `Incident ${shortId} was submitted as ${input.severity} severity.`,
      }))
    );
  }

  const parentIncidentId = input.linkedToPrimary;
  if (parentIncidentId) {
    const parentId = shortIncidentId(parentIncidentId);
    drafts.push(
      ...staffIds.map((userId) => ({
        userId,
        incidentId: parentIncidentId,
        type: "duplicate_detected" as const,
        title: "Supporting report linked",
        message: `Report ${shortId} was linked as supporting evidence to incident ${parentId}.`,
      }))
    );
  }

  await insertNotifications(drafts);
}
