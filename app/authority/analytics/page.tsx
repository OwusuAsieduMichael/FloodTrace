import { PageHeader } from "@/components/layout/page-header";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getIncidentAnalytics, parseAnalyticsRange } from "@/lib/analytics";

export const metadata = {
  title: "Analytics",
  description: "Operational incident metrics computed from live FloodTrace records.",
};

interface AuthorityAnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AuthorityAnalyticsPage({
  searchParams,
}: AuthorityAnalyticsPageProps) {
  const { range: rangeParam } = await searchParams;
  const range = parseAnalyticsRange(rangeParam);
  const snapshot = await getIncidentAnalytics(range);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Operational metrics from camera-verified incident records. Empty values mean no matching reports, not estimates."
      />
      <AnalyticsDashboard
        snapshot={snapshot}
        rangeHref={(nextRange) =>
          nextRange === "30d"
            ? "/authority/analytics"
            : `/authority/analytics?range=${nextRange}`
        }
        description="Primary incidents drive the KPIs. Supporting reports are counted separately and never invented."
      />
    </div>
  );
}
