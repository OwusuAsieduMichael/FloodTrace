import Link from "next/link";
import { notFound } from "next/navigation";

import { IncidentActions } from "@/components/authority/incident-actions";
import { IncidentInspection } from "@/components/authority/incident-inspection";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  getAuthorityIncidentById,
  getAuthorityIncidentMedia,
  getAuthorityIncidentStatusHistory,
  getSupportingIncidents,
} from "@/lib/incidents/authority";
import { formatIncidentType, formatShortId } from "@/lib/incidents/format";

interface AuthorityIncidentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuthorityIncidentDetailPageProps) {
  const { id } = await params;
  return {
    title: `Incident #${formatShortId(id)}`,
  };
}

export default async function AuthorityIncidentDetailPage({
  params,
}: AuthorityIncidentDetailPageProps) {
  const { id } = await params;
  const incident = await getAuthorityIncidentById(id);

  if (!incident) {
    notFound();
  }

  const [history, media, supporting] = await Promise.all([
    getAuthorityIncidentStatusHistory(incident.id),
    getAuthorityIncidentMedia(incident.id),
    getSupportingIncidents(incident.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Incident #${formatShortId(incident.id)}`}
        description={formatIncidentType(incident.incident_type)}
        actions={
          <div className="flex flex-wrap gap-2">
            <IncidentActions incidentId={incident.id} status={incident.status} />
            <Button variant="outline" render={<Link href="/authority/incidents" />}>
              Back to incidents
            </Button>
          </div>
        }
      />

      <IncidentInspection
        incident={incident}
        media={media}
        supporting={supporting}
        history={history}
      />
    </div>
  );
}
