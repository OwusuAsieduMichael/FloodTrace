import Link from "next/link";
import { BarChart3, ClipboardCheck, MapPinned, Truck } from "lucide-react";

import { AttentionQueue } from "@/components/authority/attention-queue";
import { AuthorityKpiCards } from "@/components/authority/kpi-cards";
import { IncidentTable } from "@/components/authority/incident-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAuthorityAttentionIncidents,
  getAuthorityIncidentStats,
  getAuthorityIncidents,
  type AuthorityIncidentListItem,
  type AuthorityIncidentStats,
} from "@/lib/incidents/authority";

export const metadata = {
  title: "Operations overview",
  description: "Authority control center for flood and drainage incident response.",
};

const EMPTY_STATS: AuthorityIncidentStats = {
  total: 0,
  pendingVerification: 0,
  verified: 0,
  assigned: 0,
  resolved: 0,
  critical: 0,
  supportingReports: 0,
};

export default async function AuthorityDashboardPage() {
  let stats: AuthorityIncidentStats = EMPTY_STATS;
  let attention: AuthorityIncidentListItem[] = [];
  let latest: AuthorityIncidentListItem[] = [];

  try {
    [stats, attention, latest] = await Promise.all([
      getAuthorityIncidentStats(),
      getAuthorityAttentionIncidents(6),
      getAuthorityIncidents({ scope: "primary", limit: 6 }),
    ]);
  } catch (error) {
    console.error("Failed to load authority dashboard data:", error);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations overview"
        description="Monitor verification queues and incident response across reported locations."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/authority/verification" />}
            >
              <ClipboardCheck className="size-4" />
              Verification
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/authority/map" />}
            >
              <MapPinned className="size-4" />
              Map
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/authority/assignments" />}
            >
              <Truck className="size-4" />
              Assignments
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/authority/analytics" />}
            >
              <BarChart3 className="size-4" />
              Analytics
            </Button>
          </div>
        }
      />

      <AuthorityKpiCards stats={stats} />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <AttentionQueue incidents={attention} />
        </div>
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle className="text-base">Latest incidents</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/authority/incidents" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <IncidentTable
              incidents={latest}
              emptyTitle="No incidents yet"
              emptyDescription="Citizen reports will appear here after they are submitted with camera evidence."
              showEmptyAction={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
