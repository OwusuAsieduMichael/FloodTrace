import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, MapPinned, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AuthorityDashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations overview"
        description={
          profile?.full_name
            ? `${profile.full_name}, monitor verification queues and incident response across your jurisdiction.`
            : "Monitor verification queues and incident response across your jurisdiction."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <ClipboardCheck className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Verification queue</CardTitle>
            <CardDescription>
              Review submitted reports — Phase 15.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <Users className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Assignments</CardTitle>
            <CardDescription>
              Manage active incident assignments — Phase 16.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <MapPinned className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Operations map</CardTitle>
            <CardDescription>
              Operational incident overview — Phase 14.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
