"use client";

import Link from "next/link";

import type { PublicMapIncident } from "@/lib/incidents/public";
import { formatIncidentDate, formatIncidentLocation, formatIncidentType, formatShortId } from "@/lib/incidents/format";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";

interface MapIncidentPopupProps {
  incident: PublicMapIncident;
  href?: string;
}

export function MapIncidentPopup({ incident, href }: MapIncidentPopupProps) {
  return (
    <div className="min-w-[180px] max-w-[min(16rem,calc(100vw-3rem))] space-y-2 p-1">
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
      <p className="text-xs text-muted-foreground">
        {formatIncidentLocation(
          incident.location_name,
          incident.latitude,
          incident.longitude
        )}
      </p>
      {incident.description ? (
        <p className="line-clamp-3 text-xs text-muted-foreground">{incident.description}</p>
      ) : null}
      <p className="text-[11px] text-muted-foreground">
        Reported {formatIncidentDate(incident.submitted_at)}
      </p>
      {href ? (
        <Link href={href} className="text-xs font-medium text-primary hover:underline">
          Open incident
        </Link>
      ) : null}
    </div>
  );
}
