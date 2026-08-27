import Link from "next/link";

import { IncidentStatusTimeline } from "@/components/citizen/incident-status-timeline";
import { SupportingReportNotice } from "@/components/citizen/supporting-report-notice";
import { IncidentLocationMap } from "@/components/maps/incident-location-map";
import { EvidenceGallery } from "@/components/media/evidence-gallery";
import { ResolutionRecordCard } from "@/components/media/resolution-record-card";
import { IncidentLocationLabel } from "@/components/shared/incident-location-label";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AuthorityIncidentDetail,
  AuthorityIncidentListItem,
} from "@/lib/incidents/authority";
import { authorityIncidentHref } from "@/lib/incidents/authority-href";
import {
  formatIncidentDate,
  formatIncidentType,
  formatShortId,
} from "@/lib/incidents/format";
import { getIncidentResolution } from "@/lib/incidents/resolutions";
import type { IncidentStatusHistory } from "@/types";
import type { IncidentMediaWithUrl } from "@/lib/storage";

interface IncidentInspectionProps {
  incident: AuthorityIncidentDetail;
  media: IncidentMediaWithUrl[];
  supporting: AuthorityIncidentListItem[];
  history: IncidentStatusHistory[];
}

export async function IncidentInspection({
  incident,
  media,
  supporting,
  history,
}: IncidentInspectionProps) {
  const evidence = media.filter((item) => item.media_source === "citizen_evidence");
  const resolution = await getIncidentResolution(incident.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={incident.status} />
        <SeverityBadge severity={incident.severity} />
        {!incident.is_primary ? <Badge variant="secondary">Supporting report</Badge> : null}
      </div>

      {incident.parent_incident_id ? (
        <SupportingReportNotice
          parentIncidentId={incident.parent_incident_id}
          href={authorityIncidentHref(incident.parent_incident_id)}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {resolution ? (
            <ResolutionRecordCard documentation={resolution} />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence</CardTitle>
              <CardDescription>
                Camera-verified media submitted with this report. GPS and capture time are stored with the file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvidenceGallery media={evidence} />
            </CardContent>
          </Card>

          {incident.description ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {incident.description}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supporting reports</CardTitle>
              <CardDescription>
                Duplicate or nearby submissions linked to this primary incident.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supporting.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No supporting reports are linked to this incident.
                </p>
              ) : (
                <ul className="space-y-2">
                  {supporting.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={authorityIncidentHref(item.id)}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/30"
                      >
                        <span className="font-mono text-xs">#{formatShortId(item.id)}</span>
                        <span className="text-muted-foreground">
                          {formatIncidentType(item.incident_type)} ·{" "}
                          {formatIncidentDate(item.submitted_at)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">
                <IncidentLocationLabel
                  locationName={incident.location_name}
                  latitude={incident.latitude}
                  longitude={incident.longitude}
                />
              </p>
              <IncidentLocationMap incident={incident} />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href="/authority/map" />}
              >
                Open operations map
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Reporter: </span>
                {incident.reporter_name ?? "Citizen"}
              </p>
              <p>
                <span className="text-muted-foreground">Assigned to: </span>
                {incident.assignee_name ?? "Unassigned"}
              </p>
              <p>
                <span className="text-muted-foreground">Submitted: </span>
                {formatIncidentDate(incident.submitted_at)}
              </p>
              <p>
                <span className="text-muted-foreground">Captured: </span>
                {formatIncidentDate(incident.captured_at)}
              </p>
              {incident.verification_notes ? (
                <p>
                  <span className="text-muted-foreground">Verification notes: </span>
                  {incident.verification_notes}
                </p>
              ) : null}
              {incident.authority_feedback ? (
                <p>
                  <span className="text-muted-foreground">Feedback: </span>
                  {incident.authority_feedback}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <IncidentStatusTimeline currentStatus={incident.status} />
            </CardContent>
          </Card>

          {history.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit trail</CardTitle>
                <CardDescription>Recorded status changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">
                      {entry.previous_status
                        ? `${entry.previous_status} → ${entry.new_status}`
                        : entry.new_status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatIncidentDate(entry.created_at)}
                    </p>
                    {entry.comment ? (
                      <p className="mt-1 text-muted-foreground">{entry.comment}</p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
