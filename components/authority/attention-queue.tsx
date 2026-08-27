import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";

import { IncidentActions } from "@/components/authority/incident-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthorityIncidentListItem } from "@/lib/incidents/authority";
import { authorityIncidentHref } from "@/lib/incidents/authority-href";
import {
  formatIncidentLocation,
  formatIncidentType,
  formatRelativeDate,
  formatShortId,
} from "@/lib/incidents/format";

interface AttentionQueueProps {
  incidents: AuthorityIncidentListItem[];
}

export function AttentionQueue({ incidents }: AttentionQueueProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base">Needs attention</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/authority/incidents?status=pending" />}
        >
          Queue
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Queue is clear"
            description="No pending or critical primary incidents need review right now."
            className="py-8"
          />
        ) : (
          <ul className="space-y-3">
            {incidents.map((incident) => (
              <li
                key={incident.id}
                className="space-y-2 rounded-lg border border-border/70 p-3"
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
                </div>
                <p className="text-sm font-medium">
                  {formatIncidentType(incident.incident_type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDate(incident.submitted_at)}
                  {` · ${formatIncidentLocation(
                    incident.location_name,
                    incident.latitude,
                    incident.longitude
                  )}`}
                </p>
                <IncidentActions
                  incidentId={incident.id}
                  status={incident.status}
                  compact
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
