import Link from "next/link";
import { notFound } from "next/navigation";

import { IncidentStatusTimeline } from "@/components/citizen/incident-status-timeline";
import { SupportingReportNotice } from "@/components/citizen/supporting-report-notice";
import { EvidenceGallery } from "@/components/media/evidence-gallery";
import { ResolutionRecordCard } from "@/components/media/resolution-record-card";
import { PageHeader } from "@/components/layout/page-header";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  formatCoordinates,
  formatIncidentDate,
  formatIncidentType,
  formatShortId,
  getCitizenIncidentById,
  getCitizenIncidentMedia,
  getCitizenIncidentStatusHistory,
} from "@/lib/incidents";
import { getIncidentResolution } from "@/lib/incidents/resolutions";

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CitizenReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    notFound();
  }

  const incident = await getCitizenIncidentById(id, profile.id);

  if (!incident) {
    notFound();
  }

  const resolutionIncidentId = incident.is_primary
    ? incident.id
    : (incident.parent_incident_id ?? incident.id);

  const [history, media, resolution] = await Promise.all([
    getCitizenIncidentStatusHistory(incident.id),
    getCitizenIncidentMedia(incident.id),
    getIncidentResolution(resolutionIncidentId),
  ]);

  const primaryMedia = media.filter((item) => item.media_source === "citizen_evidence");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Report #${formatShortId(incident.id)}`}
        description={formatIncidentType(incident.incident_type)}
        actions={
          <Button variant="outline" render={<Link href="/citizen/reports" />}>
            Back to reports
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={incident.status} />
        <SeverityBadge severity={incident.severity} />
      </div>

      {incident.parent_incident_id ? (
        <SupportingReportNotice parentIncidentId={incident.parent_incident_id} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {resolution ? (
            <ResolutionRecordCard
              documentation={resolution}
              title={
                incident.is_primary
                  ? "Resolution"
                  : "Resolution on primary incident"
              }
            />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence</CardTitle>
              <CardDescription>
                Original camera-verified evidence submitted with this report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvidenceGallery media={primaryMedia} />
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

          {incident.authority_feedback ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Authority feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{incident.authority_feedback}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {incident.location_name ? (
                <p className="font-medium">{incident.location_name}</p>
              ) : null}
              <p className="font-mono text-muted-foreground">
                {formatCoordinates(incident.latitude, incident.longitude)}
              </p>
              <p className="text-muted-foreground">
                Submitted {formatIncidentDate(incident.submitted_at)}
              </p>
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
