import { IncidentFilters } from "@/components/authority/incident-filters";
import { IncidentTable } from "@/components/authority/incident-table";
import { PageHeader } from "@/components/layout/page-header";
import {
  filterAuthorityIncidents,
  getAuthorityIncidents,
  parseAuthorityIncidentFilters,
} from "@/lib/incidents/authority";

export const metadata = {
  title: "Incidents",
  description: "Search, filter, and inspect operational flood and drainage incidents.",
};

interface AuthorityIncidentsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    severity?: string;
    scope?: string;
  }>;
}

export default async function AuthorityIncidentsPage({
  searchParams,
}: AuthorityIncidentsPageProps) {
  const raw = await searchParams;
  const filters = parseAuthorityIncidentFilters(raw);
  const all = await getAuthorityIncidents({ scope: "all" });
  const scopedTotal = filterAuthorityIncidents(all, {
    scope: filters.scope ?? "primary",
  }).length;
  const incidents = filterAuthorityIncidents(all, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents"
        description="Search and filter submitted reports. Open an incident to inspect evidence, GPS, and supporting reports."
      />
      <IncidentFilters
        filters={filters}
        resultCount={incidents.length}
        totalCount={scopedTotal}
      />
      <IncidentTable incidents={incidents} />
    </div>
  );
}
