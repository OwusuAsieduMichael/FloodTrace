import Link from "next/link";

import { ReportRow } from "@/components/citizen/recent-reports-list";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getCitizenIncidents,
  IN_PROGRESS_STATUSES,
  PENDING_STATUSES,
} from "@/lib/incidents";
import { FileText } from "lucide-react";

interface CitizenReportsPageProps {
  searchParams: Promise<{ status?: string }>;
}

function filterByStatusParam(
  incidents: Awaited<ReturnType<typeof getCitizenIncidents>>,
  statusParam?: string
) {
  if (!statusParam) {
    return incidents;
  }

  switch (statusParam) {
    case "pending":
      return incidents.filter((incident) =>
        PENDING_STATUSES.includes(incident.status)
      );
    case "verified":
      return incidents.filter((incident) =>
        IN_PROGRESS_STATUSES.includes(incident.status)
      );
    case "resolved":
      return incidents.filter((incident) => incident.status === "resolved");
    case "rejected":
      return incidents.filter((incident) => incident.status === "rejected");
    default:
      return incidents;
  }
}

const filterTabs: { label: string; value?: string }[] = [
  { label: "All" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Resolved", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

export default async function CitizenReportsPage({
  searchParams,
}: CitizenReportsPageProps) {
  const profile = await getCurrentProfile();
  const { status } = await searchParams;

  if (!profile) {
    return null;
  }

  const allIncidents = await getCitizenIncidents(profile.id);
  const incidents = filterByStatusParam(allIncidents, status);

  return (
    <div className="space-y-8">
      <PageHeader
        title="My reports"
        description="Track submitted incidents, authority feedback, and resolution progress."
        actions={
          <Button render={<Link href="/citizen/report" />}>New report</Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = (tab.value ?? undefined) === (status ?? undefined);

          return (
            <Button
              key={tab.label}
              size="sm"
              variant={isActive ? "default" : "outline"}
              render={
                <Link
                  href={
                    tab.value ? `/citizen/reports?status=${tab.value}` : "/citizen/reports"
                  }
                />
              }
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {incidents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            allIncidents.length === 0
              ? "You have not submitted any reports"
              : "No reports match this filter"
          }
          description={
            allIncidents.length === 0
              ? "Report a flood or blocked drain with camera-verified evidence to get started."
              : "Try another filter or view all reports."
          }
          action={
            allIncidents.length === 0 ? (
              <Button render={<Link href="/citizen/report" />}>Report an incident</Button>
            ) : (
              <Button variant="outline" render={<Link href="/citizen/reports" />}>
                View all reports
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <ReportRow key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
