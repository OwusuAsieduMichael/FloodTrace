import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AssignmentForm } from "@/components/authority/assignment-form";
import { IncidentInspection } from "@/components/authority/incident-inspection";
import { VerificationQueueList } from "@/components/authority/verification-queue-list";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getAuthorityIncidentById,
  getAuthorityIncidentMedia,
  getAuthorityIncidentStatusHistory,
  getAuthorityIncidents,
  getSupportingIncidents,
} from "@/lib/incidents/authority";
import { authorityIncidentHref, authorityWorkflowHref } from "@/lib/incidents/authority-href";
import {
  getAssignableStaff,
  getIncidentAssignments,
  staffDisplayName,
} from "@/lib/incidents/assignments";
import { formatIncidentDate, formatShortId } from "@/lib/incidents/format";

export const metadata = {
  title: "Assignments",
  description: "Assign verified incidents to response officers and track ownership.",
};

interface AuthorityAssignmentsPageProps {
  searchParams: Promise<{ incident?: string }>;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AuthorityAssignmentsPage({
  searchParams,
}: AuthorityAssignmentsPageProps) {
  const profile = await getCurrentProfile();
  const { incident: incidentParam } = await searchParams;
  const selectedId =
    incidentParam && uuidPattern.test(incidentParam) ? incidentParam : undefined;

  const [unassigned, assigned, staff] = await Promise.all([
    getAuthorityIncidents({ status: "verified", scope: "primary" }),
    getAuthorityIncidents({ status: "assigned", scope: "primary" }),
    getAssignableStaff(),
  ]);

  const queue = [...unassigned, ...assigned];
  const selected = selectedId ? await getAuthorityIncidentById(selectedId) : null;
  const extras = selected
    ? await Promise.all([
        getAuthorityIncidentMedia(selected.id),
        getSupportingIncidents(selected.id),
        getAuthorityIncidentStatusHistory(selected.id),
        getIncidentAssignments(selected.id),
      ])
    : null;

  const canAssign =
    selected &&
    selected.is_primary &&
    (selected.status === "verified" || selected.status === "assigned");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Assignments"
        description="Assign verified incidents to an approved officer. Reassign if ownership needs to change."
        backFallbackHref="/authority/dashboard"
        backLabel="Back to dashboard"
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-3 xl:col-span-2">
          <h2 className="portal-on-photo text-sm font-medium">
            Ready to assign ({unassigned.length}) · Active ({assigned.length})
          </h2>
          <VerificationQueueList
            incidents={queue}
            selectedId={selectedId}
            hrefFor={(id) => `/authority/assignments?incident=${id}`}
            emptyTitle="No incidents ready to assign"
            emptyDescription="Verified reports appear here. After assignment they stay listed so you can reassign."
            emptyIcon={ShieldCheck}
            metaLine={(incident) =>
              incident.assignee_name ? `Assigned to ${incident.assignee_name}` : "Unassigned"
            }
          />
        </div>

        <div className="xl:col-span-3">
          {!selectedId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select an incident</CardTitle>
                <CardDescription>
                  Choose a verified or assigned report, then pick the officer responsible for response.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : !selected || !extras || !profile ? (
            <Alert variant="destructive">
              <AlertTitle>Incident not found</AlertTitle>
              <AlertDescription>
                This report is missing or you no longer have access to it.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="portal-on-photo text-lg font-semibold">
                  Assign #{formatShortId(selected.id)}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={authorityIncidentHref(selected.id)} />}
                >
                  Open full record
                </Button>
              </div>

              {!selected.is_primary && selected.parent_incident_id ? (
                <Alert variant="info">
                  <AlertTitle>Supporting report</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Assignments are recorded on the primary incident.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={authorityWorkflowHref("assign", selected.parent_incident_id)}
                        />
                      }
                    >
                      Assign primary
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {canAssign ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {selected.status === "assigned" ? "Reassign officer" : "Assign officer"}
                    </CardTitle>
                    <CardDescription>
                      {selected.assignee_name
                        ? `Currently assigned to ${selected.assignee_name}.`
                        : "No officer is assigned yet."}{" "}
                      The assigned officer appears on the response board.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssignmentForm
                      incidentId={selected.id}
                      staff={staff}
                      currentUserId={profile.id}
                      currentAssigneeId={selected.assigned_to}
                    />
                  </CardContent>
                </Card>
              ) : selected.is_primary ? (
                <Alert>
                  <AlertTitle>Not ready to assign</AlertTitle>
                  <AlertDescription>
                    This incident is {selected.status.replaceAll("_", " ")}. Verify it before assigning a response officer.
                  </AlertDescription>
                </Alert>
              ) : null}

              {extras[3].length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assignment history</CardTitle>
                    <CardDescription>Active and previous ownership records</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {extras[3].map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                      >
                        <p className="font-medium">
                          {entry.assignee_name ?? staffDisplayName({ id: entry.authority_id, full_name: null })}
                          {entry.is_active ? " · Active" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatIncidentDate(entry.assigned_at)}
                          {entry.assigned_by_name
                            ? ` · assigned by ${entry.assigned_by_name}`
                            : ""}
                        </p>
                        {entry.notes ? (
                          <p className="mt-1 text-muted-foreground">{entry.notes}</p>
                        ) : null}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              <IncidentInspection
                incident={selected}
                media={extras[0]}
                supporting={extras[1]}
                history={extras[2]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
