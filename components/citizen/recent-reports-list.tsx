import Link from "next/link";
import { ArrowRight, FileText, MapPin } from "lucide-react";

import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { CitizenIncidentListItem } from "@/lib/incidents";
import {
  formatIncidentType,
  formatRelativeDate,
  formatShortId,
} from "@/lib/incidents";

interface ReportRowProps {
  incident: CitizenIncidentListItem;
}

export function ReportRow({ incident }: ReportRowProps) {
  return (
    <Link
      href={`/citizen/reports/${incident.id}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            #{formatShortId(incident.id)}
          </span>
          <StatusBadge status={incident.status} />
          <SeverityBadge severity={incident.severity} />
        </div>
        <p className="font-medium">{formatIncidentType(incident.incident_type)}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{formatRelativeDate(incident.submitted_at)}</span>
          {incident.location_name ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {incident.location_name}
            </span>
          ) : null}
        </div>
      </div>
      <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
    </Link>
  );
}

interface RecentReportsListProps {
  incidents: CitizenIncidentListItem[];
}

export function RecentReportsList({ incidents }: RecentReportsListProps) {
  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No reports yet"
        description="When you submit a flood or drainage report, it will appear here with live status updates."
        action={
          <Button size="sm" render={<Link href="/citizen/report" />}>
            Report an incident
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <ReportRow key={incident.id} incident={incident} />
      ))}
    </div>
  );
}

interface RecentReportsSectionProps {
  incidents: CitizenIncidentListItem[];
}

export function RecentReportsSection({ incidents }: RecentReportsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base">Recent reports</CardTitle>
        {incidents.length > 0 ? (
          <Button variant="ghost" size="sm" render={<Link href="/citizen/reports" />}>
            View all
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <RecentReportsList incidents={incidents} />
      </CardContent>
    </Card>
  );
}
