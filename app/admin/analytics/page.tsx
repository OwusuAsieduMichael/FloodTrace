import { PageHeader } from "@/components/layout/page-header";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import {
  getAccountAnalytics,
  getIncidentAnalytics,
  parseAnalyticsRange,
} from "@/lib/analytics";

export const metadata = {
  title: "Analytics",
  description: "System-wide incident and account metrics from live FloodTrace records.",
};

interface AdminAnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  const { range: rangeParam } = await searchParams;
  const range = parseAnalyticsRange(rangeParam);
  const [snapshot, accounts] = await Promise.all([
    getIncidentAnalytics(range),
    getAccountAnalytics(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Platform-wide incident and account metrics. All figures come from the live database."
      />
      <AnalyticsDashboard
        snapshot={snapshot}
        accounts={accounts}
        rangeHref={(nextRange) =>
          nextRange === "30d" ? "/admin/analytics" : `/admin/analytics?range=${nextRange}`
        }
        description="Account totals are current. Incident charts follow the selected reporting window."
      />
    </div>
  );
}
