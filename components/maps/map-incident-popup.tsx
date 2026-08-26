"use client";

import type { PublicMapIncident } from "@/lib/incidents/public";
import { formatIncidentDate, formatIncidentType, formatShortId } from "@/lib/incidents/format";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";

interface MapIncidentPopupProps {
  incident: PublicMapIncident;
}

export function MapIncidentPopup({ incident }: MapIncidentPopupProps) {
  return (
    <div className="min-w-[220px] space-y-2 p-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-foreground">
          #{formatShortId(incident.id)}
        </span>
        <StatusBadge status={incident.status} />
        <SeverityBadge severity={incident.severity} />
      </div>
      <p className="text-sm font-medium text-foreground">
        {formatIncidentType(incident.incident_type)}
      </p>
      {incident.location_name ? (
        <p className="text-xs text-muted-foreground">{incident.location_name}</p>
      ) : null}
      {incident.description ? (
        <p className="line-clamp-3 text-xs text-muted-foreground">{incident.description}</p>
      ) : null}
      <p className="text-[11px] text-muted-foreground">
        Reported {formatIncidentDate(incident.submitted_at)}
      </p>
    </div>
  );
}
