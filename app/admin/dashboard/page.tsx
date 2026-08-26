import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Settings, ShieldCheck, UserCog } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Administration"
        description={
          profile?.full_name
            ? `${profile.full_name}, manage authority approvals, users, and platform configuration.`
            : "Manage authority approvals, users, and platform configuration."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/authorities" className="group">
        <Card className="h-full transition-shadow group-hover:shadow-md">
          <CardHeader>
            <UserCog className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Authority approvals</CardTitle>
            <CardDescription>
              Review pending authority registrations.
            </CardDescription>
          </CardHeader>
        </Card>
        </Link>

        <Link href="/admin/incidents" className="group">
        <Card className="h-full transition-shadow group-hover:shadow-md">
          <CardHeader>
            <ShieldCheck className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Incident oversight</CardTitle>
            <CardDescription>
              Platform-wide incident monitoring.
            </CardDescription>
          </CardHeader>
        </Card>
        </Link>

        <Link href="/admin/config" className="group">
        <Card className="h-full transition-shadow group-hover:shadow-md">
          <CardHeader>
            <Settings className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">App configuration</CardTitle>
            <CardDescription>
              Emergency contacts and duplicate detection settings.
            </CardDescription>
          </CardHeader>
        </Card>
        </Link>

        <Link href="/admin/analytics" className="group">
        <Card className="h-full transition-shadow group-hover:shadow-md">
          <CardHeader>
            <BarChart3 className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Analytics</CardTitle>
            <CardDescription>
              Live incident trends, resolution times, and account totals.
            </CardDescription>
          </CardHeader>
        </Card>
        </Link>
      </div>
    </div>
  );
}
