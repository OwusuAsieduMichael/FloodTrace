import { PublicIncidentMap } from "@/components/maps/public-incident-map";
import { PageHeader } from "@/components/layout/page-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublicMapIncidents } from "@/lib/incidents/public";
import { getWeather } from "@/lib/weather";

export const metadata = {
  title: "Live flood map",
  description:
    "Interactive map of verified flood and drainage incidents with filters by type and status.",
};

export default async function MapPage() {
  const [incidents, weather] = await Promise.all([
    getPublicMapIncidents(),
    getWeather(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <PageHeader
          title="Live flood map"
          description="Verified and resolved incidents reported by the community. Filter by type and status, then click a marker for details."
          backFallbackHref="/"
          backLabel="Back to home"
        />
        <PublicIncidentMap
          incidents={incidents}
          weather={weather.ok ? weather.data : null}
        />
      </main>
      <SiteFooter />
    </>
  );
}
