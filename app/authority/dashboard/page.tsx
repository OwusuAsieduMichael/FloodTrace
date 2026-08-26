import Link from "next/link";
import { BarChart3, ClipboardCheck, MapPinned, Truck } from "lucide-react";

import { AttentionQueue } from "@/components/authority/attention-queue";
import { AuthorityKpiCards } from "@/components/authority/kpi-cards";
import { IncidentTable } from "@/components/authority/incident-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getAuthorityAttentionIncidents,
  getAuthorityIncidentStats,
  getAuthorityIncidents,
} from "@/lib/incidents/authority";

export const metadata = {
  title: "Operations overview",
  description: "Authority control center for flood and drainage incident response.",
};

export default async function AuthorityDashboardPage() {
  const profile = await getCurrentProfile();

  const [stats, attention, latest] = await Promise.all([
    getAuthorityIncidentStats(),
    getAuthorityAttentionIncidents(6),
    getAuthorityIncidents({ scope: "primary" }),
  ]);

  const recent = latest.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations overview"
        description={
          profile?.full_name
            ? `${profile.full_name}, monitor verification queues and incident response.`
            : "Monitor verification queues and incident response across reported locations."
        }
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
              incidents={recent}
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
