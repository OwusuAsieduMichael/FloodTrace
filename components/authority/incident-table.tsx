import Link from "next/link";
import { ListChecks, MapPin } from "lucide-react";

import { IncidentActions } from "@/components/authority/incident-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AuthorityIncidentListItem } from "@/lib/incidents/authority";
import { authorityIncidentHref } from "@/lib/incidents/authority-href";
import {
  formatIncidentLocation,
  formatIncidentType,
  formatRelativeDate,
  formatShortId,
} from "@/lib/incidents/format";

interface IncidentTableProps {
  incidents: AuthorityIncidentListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  showEmptyAction?: boolean;
}

export function IncidentTable({
  incidents,
  emptyTitle = "No incidents match these filters",
  emptyDescription = "Try another status, severity, or search term.",
  showEmptyAction = true,
}: IncidentTableProps) {
  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title={emptyTitle}
        description={emptyDescription}
        action={
          showEmptyAction ? (
            <Button variant="outline" render={<Link href="/authority/incidents" />}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border lg:block">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Incident</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reports</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Assigned to</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link
                    href={authorityIncidentHref(incident.id)}
                    className="font-mono text-xs font-medium hover:underline"
                  >
                    #{formatShortId(incident.id)}
                  </Link>
                  {!incident.is_primary ? (
                    <Badge variant="secondary" className="ml-2">
                      Supporting
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3">{formatIncidentType(incident.incident_type)}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">
                  {formatIncidentLocation(
                    incident.location_name,
                    incident.latitude,
                    incident.longitude
                  )}
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-4 py-3 tabular-nums">{incident.supporting_count}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRelativeDate(incident.submitted_at)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {incident.assignee_name ?? "Unassigned"}
                </td>
                <td className="px-4 py-3">
                  <IncidentActions
                    incidentId={incident.id}
                    status={incident.status}
                    compact
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {incidents.map((incident) => (
          <article
            key={incident.id}
            className="space-y-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={authorityIncidentHref(incident.id)}
                className="font-mono text-xs font-medium hover:underline"
              >
                #{formatShortId(incident.id)}
              </Link>
              <StatusBadge status={incident.status} />
              <SeverityBadge severity={incident.severity} />
              {!incident.is_primary ? (
                <Badge variant="secondary">Supporting</Badge>
              ) : null}
            </div>
            <p className="font-medium">{formatIncidentType(incident.incident_type)}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{formatRelativeDate(incident.submitted_at)}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {formatIncidentLocation(
                  incident.location_name,
                  incident.latitude,
                  incident.longitude
                )}
              </span>
              <span>
                {incident.supporting_count} supporting report
                {incident.supporting_count === 1 ? "" : "s"}
              </span>
              <span>{incident.assignee_name ?? "Unassigned"}</span>
            </div>
            <IncidentActions incidentId={incident.id} status={incident.status} />
          </article>
        ))}
      </div>
    </>
  );
}
