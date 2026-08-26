import Link from "next/link";
import { Wrench } from "lucide-react";

import { IncidentInspection } from "@/components/authority/incident-inspection";
import { ResolutionForm } from "@/components/authority/resolution-form";
import { VerificationQueueList } from "@/components/authority/verification-queue-list";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAuthorityIncidentById,
  getAuthorityIncidentMedia,
  getAuthorityIncidentStatusHistory,
  getAuthorityIncidents,
  getSupportingIncidents,
} from "@/lib/incidents/authority";
import { authorityIncidentHref, authorityWorkflowHref } from "@/lib/incidents/authority-href";
import { formatIncidentDate, formatShortId } from "@/lib/incidents/format";
import { getPrimaryCitizenEvidence } from "@/lib/incidents/resolutions";

export const metadata = {
  title: "Resolution",
  description: "Document completed work with before/after evidence and close assigned incidents.",
};

interface AuthorityResolutionPageProps {
  searchParams: Promise<{ incident?: string }>;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AuthorityResolutionPage({
  searchParams,
}: AuthorityResolutionPageProps) {
  const { incident: incidentParam } = await searchParams;
  const selectedId =
    incidentParam && uuidPattern.test(incidentParam) ? incidentParam : undefined;

  const [assigned, resolved] = await Promise.all([
    getAuthorityIncidents({ status: "assigned", scope: "primary" }),
    getAuthorityIncidents({ status: "resolved", scope: "primary" }),
  ]);

  const recentResolved = resolved.slice(0, 20);
  const queue = [...assigned, ...recentResolved];
  const selected = selectedId ? await getAuthorityIncidentById(selectedId) : null;
  const extras = selected
    ? await Promise.all([
        getAuthorityIncidentMedia(selected.id),
        getSupportingIncidents(selected.id),
        getAuthorityIncidentStatusHistory(selected.id),
        getPrimaryCitizenEvidence(selected.id),
      ])
    : null;

  const canResolve =
    selected && selected.is_primary && selected.status === "assigned";
  const alreadyResolved =
    selected && selected.is_primary && selected.status === "resolved";
  const beforeEvidence = extras?.[3] ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resolution"
        description="Capture an after photograph, record what was done, and close assigned incidents with public before/after evidence."
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-3 xl:col-span-2">
          <h2 className="text-sm font-medium">
            Assigned ({assigned.length}) · Recently resolved ({recentResolved.length})
          </h2>
          <VerificationQueueList
            incidents={queue}
            selectedId={selectedId}
            hrefFor={(id) => `/authority/resolution?incident=${id}`}
            emptyTitle="No incidents ready to resolve"
            emptyDescription="Assigned incidents appear here. After you document completed work they move to resolved."
            emptyIcon={Wrench}
            metaLine={(incident) =>
              incident.status === "resolved"
                ? "Resolved"
                : incident.assignee_name
                  ? `Assigned to ${incident.assignee_name}`
                  : "Assigned"
            }
          />
        </div>

        <div className="xl:col-span-3">
          {!selectedId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select an incident</CardTitle>
                <CardDescription>
                  Choose an assigned report, inspect the original evidence, then capture an after photograph of completed work.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : !selected || !extras ? (
            <Alert variant="destructive">
              <AlertTitle>Incident not found</AlertTitle>
              <AlertDescription>
                This report is missing or you no longer have access to it.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Resolve #{formatShortId(selected.id)}
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
                      Resolution is recorded on the primary incident.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={authorityWorkflowHref("resolve", selected.parent_incident_id)}
                        />
                      }
                    >
                      Resolve primary
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {canResolve ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Document completed work</CardTitle>
                    <CardDescription>
                      {selected.assignee_name
                        ? `Assigned to ${selected.assignee_name}. `
                        : ""}
                      The original citizen photograph is the before image. Capture a live after photograph.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {beforeEvidence ? (
                      <ResolutionForm
                        incidentId={selected.id}
                        beforePreviewUrl={beforeEvidence.display_url}
                        beforeCapturedAt={formatIncidentDate(beforeEvidence.captured_at)}
                      />
                    ) : (
                      <Alert variant="destructive">
                        <AlertTitle>Missing citizen evidence</AlertTitle>
                        <AlertDescription>
                          This incident has no before photograph on file. Resolution requires the original camera evidence.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ) : alreadyResolved ? (
                <Alert variant="success">
                  <AlertTitle>Work documented</AlertTitle>
                  <AlertDescription>
                    This incident is resolved. Before/after evidence is shown with the record below.
                  </AlertDescription>
                </Alert>
              ) : selected.is_primary ? (
                <Alert>
                  <AlertTitle>Not ready to resolve</AlertTitle>
                  <AlertDescription>
                    This incident is {selected.status.replaceAll("_", " ")}. Assign a response officer before documenting resolution.
                  </AlertDescription>
                </Alert>
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
