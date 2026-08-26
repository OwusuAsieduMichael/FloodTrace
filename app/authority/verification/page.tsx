import Link from "next/link";

import { IncidentInspection } from "@/components/authority/incident-inspection";
import { VerificationDecisionForm } from "@/components/authority/verification-form";
import { VerificationQueueList } from "@/components/authority/verification-queue-list";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PENDING_STATUSES } from "@/lib/incidents/constants";
import {
  getAuthorityIncidentById,
  getAuthorityIncidentMedia,
  getAuthorityIncidentStatusHistory,
  getAuthorityIncidents,
  getSupportingIncidents,
} from "@/lib/incidents/authority";
import { authorityIncidentHref, authorityWorkflowHref } from "@/lib/incidents/authority-href";
import { formatShortId } from "@/lib/incidents/format";
import { beginIncidentReviewAction } from "@/lib/incidents/verification-actions";

export const metadata = {
  title: "Verification queue",
  description: "Inspect evidence, GPS, and supporting reports, then verify or reject.",
};

interface AuthorityVerificationPageProps {
  searchParams: Promise<{ incident?: string; action?: string }>;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AuthorityVerificationPage({
  searchParams,
}: AuthorityVerificationPageProps) {
  const { incident: incidentParam, action } = await searchParams;
  const selectedId =
    incidentParam && uuidPattern.test(incidentParam) ? incidentParam : undefined;
  const defaultDecision = action === "reject" ? "reject" : "verify";

  const queue = await getAuthorityIncidents({ status: "pending", scope: "primary" });

  const selected = selectedId ? await getAuthorityIncidentById(selectedId) : null;

  const extras = selected
    ? await Promise.all([
        getAuthorityIncidentMedia(selected.id),
        getSupportingIncidents(selected.id),
        getAuthorityIncidentStatusHistory(selected.id),
      ])
    : null;

  const canDecide =
    selected &&
    selected.is_primary &&
    PENDING_STATUSES.includes(selected.status);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Verification queue"
        description="Inspect live camera evidence, location, and linked supporting reports before verifying or rejecting."
        backFallbackHref="/authority/dashboard"
        backLabel="Back to dashboard"
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-3 xl:col-span-2">
          <h2 className="text-sm font-medium">Pending review ({queue.length})</h2>
          <VerificationQueueList incidents={queue} selectedId={selectedId} />
        </div>

        <div className="xl:col-span-3">
          {!selectedId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select a report</CardTitle>
                <CardDescription>
                  Choose an incident from the queue to inspect evidence and record a decision.
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
                  Review #{formatShortId(selected.id)}
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
                      Decisions are recorded on the primary incident. This file stays linked as supporting evidence.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={authorityWorkflowHref("verify", selected.parent_incident_id)}
                        />
                      }
                    >
                      Review primary
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {canDecide ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Decision</CardTitle>
                    <CardDescription>
                      Verify to add this report to the public map and assignment queue. Reject with a reason the citizen can read.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected.status === "submitted" ? (
                      <form action={beginIncidentReviewAction}>
                        <input type="hidden" name="incidentId" value={selected.id} />
                        <Button type="submit" variant="outline" size="sm">
                          Mark as in review
                        </Button>
                      </form>
                    ) : null}
                    <VerificationDecisionForm
                      incidentId={selected.id}
                      defaultDecision={defaultDecision}
                    />
                  </CardContent>
                </Card>
              ) : selected.is_primary ? (
                <Alert>
                  <AlertTitle>Already reviewed</AlertTitle>
                  <AlertDescription>
                    This incident is {selected.status.replaceAll("_", " ")} and is no longer in the verification queue.
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
