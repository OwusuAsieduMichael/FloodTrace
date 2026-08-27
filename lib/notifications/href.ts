import { authorityIncidentHref } from "@/lib/incidents/authority-href";
import type { UserRole } from "@/types";

import type { NotificationType } from "./constants";

export function notificationHref(
  type: NotificationType,
  incidentId: string | null,
  role: UserRole
): string {
  if (type === "rainfall_warning") {
    return "/citizen/weather";
  }

  if (role === "citizen" && incidentId) {
    return `/citizen/reports/${incidentId}`;
  }

  if (role === "authority") {
    return incidentId ? authorityIncidentHref(incidentId) : "/authority/incidents";
  }

  if (role === "admin") {
    return "/admin/incidents";
  }

  return "/citizen/dashboard";
}
