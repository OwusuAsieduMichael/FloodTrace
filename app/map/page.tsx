import Link from "next/link";

import { PublicIncidentMap } from "@/components/maps/public-incident-map";
import { PageHeader } from "@/components/layout/page-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { getPublicMapIncidents } from "@/lib/incidents/public";

export const metadata = {
  title: "Live flood map",
  description:
    "Interactive map of verified flood and drainage incidents with filters by type and status.",
};

export default async function MapPage() {
  const incidents = await getPublicMapIncidents();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6">
        <PageHeader
          title="Live flood map"
          description="Verified and resolved incidents reported by the community. Filter by type and status, then click a marker for details."
          actions={
            <Button variant="outline" render={<Link href="/" />}>
              Back to home
            </Button>
          }
        />
        <PublicIncidentMap incidents={incidents} />
      </main>
      <SiteFooter />
    </>
  );
}
