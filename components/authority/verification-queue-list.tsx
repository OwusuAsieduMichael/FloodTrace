import Link from "next/link";
import { ClipboardCheck, type LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { IncidentLocationLabel } from "@/components/shared/incident-location-label";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";
import { cn } from "@/lib/utils";
import type { AuthorityIncidentListItem } from "@/lib/incidents/authority";
import {
  formatIncidentType,
  formatRelativeDate,
  formatShortId,
} from "@/lib/incidents/format";

interface VerificationQueueListProps {
  incidents: AuthorityIncidentListItem[];
  selectedId?: string;
  hrefFor?: (id: string) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  metaLine?: (incident: AuthorityIncidentListItem) => string | null;
}

export function VerificationQueueList({
  incidents,
  selectedId,
  hrefFor = (id) => `/authority/verification?incident=${id}`,
  emptyTitle = "Verification queue is clear",
  emptyDescription = "New citizen reports appear here after submission. Verified incidents move to assignment.",
  emptyIcon: EmptyIcon = ClipboardCheck,
  metaLine,
}: VerificationQueueListProps) {
  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={EmptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        className="py-8"
      />
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {incidents.map((incident) => {
        const selected = incident.id === selectedId;

        return (
          <li key={incident.id}>
            <Link
              href={hrefFor(incident.id)}
              className={cn(
                "block space-y-2 px-4 py-3 touch-manipulation transition-colors hover:bg-muted/40",
                selected && "bg-primary/5"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-medium">
                  #{formatShortId(incident.id)}
                </span>
                <StatusBadge status={incident.status} />
                <SeverityBadge severity={incident.severity} />
              </div>
              <p className="text-sm font-medium">
                {formatIncidentType(incident.incident_type)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeDate(incident.submitted_at)}
                {" · "}
                <IncidentLocationLabel
                  locationName={incident.location_name}
                  latitude={incident.latitude}
                  longitude={incident.longitude}
                />
                {incident.supporting_count > 0
                  ? ` · ${incident.supporting_count} supporting`
                  : ""}
                {metaLine?.(incident) ? ` · ${metaLine(incident)}` : ""}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
