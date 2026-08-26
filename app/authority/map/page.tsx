import { OperationalIncidentMap } from "@/components/maps/operational-incident-map";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthorityMapIncidents } from "@/lib/incidents/authority";

export const metadata = {
  title: "Operations map",
  description: "Geospatial view of primary incidents under authority management.",
};

export default async function AuthorityMapPage() {
  const incidents = await getAuthorityMapIncidents();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations map"
        description="All primary flood and drainage reports, including those still awaiting verification. Marker color is severity."
      />
      <OperationalIncidentMap incidents={incidents} />
    </div>
  );
}
