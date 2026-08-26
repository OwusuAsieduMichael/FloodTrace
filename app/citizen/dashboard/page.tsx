import Link from "next/link";
import { Camera, MapPin, Radio } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function CitizenDashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={
          profile?.full_name
            ? `Welcome back, ${profile.full_name}. Report incidents and track their status.`
            : "Report incidents and track their status from your citizen dashboard."
        }
        actions={
          <Button render={<Link href="/citizen/report" />}>
            <Camera className="size-4" />
            Report incident
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <Camera className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Report a flood</CardTitle>
            <CardDescription>
              Capture live camera evidence with automatic GPS — Phase 7.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" render={<Link href="/citizen/report" />}>
              Start report
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <MapPin className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">My reports</CardTitle>
            <CardDescription>
              Track submitted incidents and resolution updates — Phase 6.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" render={<Link href="/citizen/reports" />}>
              View reports
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <Radio className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Live map</CardTitle>
            <CardDescription>
              View verified incidents near you on the public map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" render={<Link href="/map" />}>
              Open map
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
