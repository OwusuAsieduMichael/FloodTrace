import Link from "next/link";
import { Truck } from "lucide-react";

import { IncidentActions } from "@/components/authority/incident-actions";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/session";
import { getAuthorityIncidents } from "@/lib/incidents/authority";
import { authorityIncidentHref } from "@/lib/incidents/authority-href";
import { getActiveAssignments } from "@/lib/incidents/assignments";
import {
  formatIncidentLocation,
  formatIncidentType,
  formatRelativeDate,
  formatShortId,
} from "@/lib/incidents/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Response tracking",
  description: "Monitor active incident assignments and field ownership.",
};

interface AuthorityResponsePageProps {
  searchParams: Promise<{ scope?: string }>;
}

export default async function AuthorityResponsePage({
  searchParams,
}: AuthorityResponsePageProps) {
  const profile = await getCurrentProfile();
  const { scope } = await searchParams;
  const mineOnly = scope === "mine";

  const assigned = await getAuthorityIncidents({ status: "assigned", scope: "primary" });
  const visible = mineOnly && profile
    ? assigned.filter((incident) => incident.assigned_to === profile.id)
    : assigned;
  const assignmentMap = await getActiveAssignments(visible.map((incident) => incident.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Response tracking"
        description="Active assignments currently in the field. Open an incident to inspect evidence or reassign ownership."
        backFallbackHref="/authority/dashboard"
        backLabel="Back to dashboard"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={mineOnly ? "outline" : "default"}
              render={<Link href="/authority/response" />}
            >
              All active
            </Button>
            <Button
              size="sm"
              variant={mineOnly ? "default" : "outline"}
              render={<Link href="/authority/response?scope=mine" />}
            >
              Assigned to me
            </Button>
          </div>
        }
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={mineOnly ? "Nothing assigned to you" : "No active responses"}
          description={
            mineOnly
              ? "Incidents assigned to you will appear here until they are resolved."
              : "Assign a verified incident to start tracking response."
          }
          action={
            <Button variant="outline" render={<Link href="/authority/assignments" />}>
              Open assignments
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((incident) => {
            const assignment = assignmentMap.get(incident.id);
            const isMine = incident.assigned_to === profile?.id;

            return (
              <Card
                key={incident.id}
                className={cn(isMine && "border-primary/40")}
              >
                <CardHeader className="space-y-3">
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
                  <CardTitle className="text-base">
                    {formatIncidentType(incident.incident_type)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    {formatIncidentLocation(
                      incident.location_name,
                      incident.latitude,
                      incident.longitude
                    )}{" "}
                    · submitted{" "}
                    {formatRelativeDate(incident.submitted_at)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Officer: </span>
                    {incident.assignee_name ?? "Unassigned"}
                    {isMine ? " (you)" : ""}
                  </p>
                  {assignment ? (
                    <p className="text-muted-foreground">
                      Assigned {formatRelativeDate(assignment.assigned_at)}
                      {assignment.assigned_by_name
                        ? ` by ${assignment.assigned_by_name}`
                        : ""}
                    </p>
                  ) : null}
                  {assignment?.notes ? (
                    <p>{assignment.notes}</p>
                  ) : null}
                  <IncidentActions incidentId={incident.id} status={incident.status} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
