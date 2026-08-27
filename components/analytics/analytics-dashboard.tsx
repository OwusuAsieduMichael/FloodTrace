import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Layers,
  ListChecks,
  ShieldX,
  Timer,
  Users,
} from "lucide-react";

import { AnalyticsBarList } from "@/components/analytics/bar-list";
import { AnalyticsMetricGrid } from "@/components/analytics/metric-grid";
import { AnalyticsRangeToggle } from "@/components/analytics/range-toggle";
import { AnalyticsTrendColumns } from "@/components/analytics/trend-columns";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ANALYTICS_RANGE_LABELS,
  formatDurationHours,
  type AccountStats,
  type AnalyticsRange,
  type AnalyticsSnapshot,
} from "@/lib/analytics";
import { formatIncidentLocation } from "@/lib/incidents/format";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  snapshot: AnalyticsSnapshot;
  rangeHref: (range: AnalyticsRange) => string;
  accounts?: AccountStats;
  description: string;
}

function severityBarClass(key: string) {
  switch (key) {
    case "critical":
      return "bg-severity-critical";
    case "high":
      return "bg-severity-high";
    case "medium":
      return "bg-severity-medium";
    case "low":
      return "bg-severity-low";
    default:
      return "bg-primary";
  }
}

function statusBarClass(key: string) {
  switch (key) {
    case "resolved":
    case "verified":
      return "bg-success";
    case "rejected":
      return "bg-destructive";
    case "assigned":
      return "bg-primary";
    default:
      return "bg-muted-foreground/50";
  }
}

export function AnalyticsDashboard({
  snapshot,
  rangeHref,
  accounts,
  description,
}: AnalyticsDashboardProps) {
  const trendCaption =
    snapshot.range === "all"
      ? "Daily primary submissions for the last 90 days."
      : `Daily primary submissions in ${ANALYTICS_RANGE_LABELS[snapshot.range].toLowerCase()}.`;

  return (
    <div className="space-y-8">
      <AnalyticsRangeToggle range={snapshot.range} hrefFor={rangeHref} />

      <p className="text-sm text-muted-foreground">{description}</p>

      <AnalyticsMetricGrid
        metrics={[
          {
            label: "Primary incidents",
            value: String(snapshot.primaries),
            hint: `${snapshot.supporting} supporting reports`,
            icon: ListChecks,
          },
          {
            label: "Pending verification",
            value: String(snapshot.pendingVerification),
            icon: ClipboardCheck,
          },
          {
            label: "Resolved",
            value: String(snapshot.resolved),
            hint: snapshot.resolutionRate
              ? `${snapshot.resolutionRate} of primaries`
              : undefined,
            icon: CheckCircle2,
          },
          {
            label: "Rejected",
            value: String(snapshot.rejected),
            hint: snapshot.rejectionRate
              ? `${snapshot.rejectionRate} of primaries`
              : undefined,
            icon: ShieldX,
          },
          {
            label: "Critical",
            value: String(snapshot.critical),
            icon: AlertTriangle,
          },
          {
            label: "Median time to verify",
            value:
              snapshot.medianVerifyHours == null
                ? "None"
                : formatDurationHours(snapshot.medianVerifyHours),
            hint:
              snapshot.verifySampleSize > 0
                ? `${snapshot.verifySampleSize} verified incidents`
                : "No verified incidents in this period",
            icon: Timer,
          },
          {
            label: "Median time to resolve",
            value:
              snapshot.medianResolveHours == null
                ? "None"
                : formatDurationHours(snapshot.medianResolveHours),
            hint:
              snapshot.resolveSampleSize > 0
                ? `${snapshot.resolveSampleSize} resolved incidents`
                : "No resolved incidents in this period",
            icon: Clock3,
          },
          {
            label: "Supporting reports",
            value: String(snapshot.supporting),
            icon: Layers,
          },
        ]}
      />

      {accounts ? (
        <AnalyticsMetricGrid
          className="xl:grid-cols-5"
          metrics={[
            {
              label: "Citizens",
              value: String(accounts.citizens),
              icon: Users,
            },
            {
              label: "Authorities approved",
              value: String(accounts.authoritiesApproved),
              icon: Users,
            },
            {
              label: "Authorities pending",
              value: String(accounts.authoritiesPending),
              icon: Users,
            },
            {
              label: "Authorities rejected",
              value: String(accounts.authoritiesRejected),
              icon: Users,
            },
            {
              label: "Admins",
              value: String(accounts.admins),
              icon: Users,
            },
          ]}
        />
      ) : null}

      {snapshot.primaries === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No incidents in this period"
          description="Analytics use live incident records only. Figures stay empty until camera-verified reports are submitted."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Submission trend</CardTitle>
              <CardDescription>
                Primary incidents only. Supporting reports are counted separately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsTrendColumns points={snapshot.trend} caption={trendCaption} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">By status</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsBarList
                items={snapshot.byStatus}
                colorClassName={statusBarClass}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">By severity</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsBarList
                items={snapshot.bySeverity}
                colorClassName={severityBarClass}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">By type</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsBarList items={snapshot.byType} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active assignments</CardTitle>
              <CardDescription>
                Officers currently assigned inside this period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {snapshot.workload.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active assignments in this period.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {snapshot.workload.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
                    >
                      <span className="truncate">{row.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {row.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Report clusters</CardTitle>
              <CardDescription>
                Approximate locations with the most primary reports (~1 km buckets). This is a count list, not a heat map.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {snapshot.clusters.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No location clusters in this period.
                </p>
              ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {snapshot.clusters.map((cluster) => (
                    <li
                      key={cluster.key}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      )}
                    >
                      <div>
                        <p className="font-medium">
                          {formatIncidentLocation(
                            cluster.location_name,
                            cluster.latitude,
                            cluster.longitude
                          )}
                        </p>
                      </div>
                      <span className="tabular-nums text-muted-foreground">
                        {cluster.count} {cluster.count === 1 ? "incident" : "incidents"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
