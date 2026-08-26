import { AvatarUpload } from "@/components/citizen/avatar-upload";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { formatIncidentDate } from "@/lib/incidents/format";

export default async function CitizenProfilePage() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Your FloodTrace citizen account details."
      />

      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Account</CardTitle>
            <Badge variant="secondary">Citizen</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <AvatarUpload
            fullName={profile.full_name}
            email={user?.email ?? ""}
            avatarUrl={profile.avatar_url}
          />

          <div>
            <p className="text-muted-foreground">Full name</p>
            <p className="font-medium">{profile.full_name ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{profile.phone ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Member since</p>
            <p className="font-medium">{formatIncidentDate(profile.created_at)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
