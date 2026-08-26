import Link from "next/link";

import { getPostAuthRedirect } from "@/lib/auth/redirects";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";

export async function HeaderAuthActions() {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
  ]);

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/auth/login" />}>
          Sign in
        </Button>
        <Button size="sm" render={<Link href="/auth/signup" />}>
          Get started
        </Button>
      </div>
    );
  }

  const roleLabels = {
    citizen: "Citizen",
    authority:
      profile.authority_status === "approved"
        ? "Authority"
        : profile.authority_status === "pending"
          ? "Authority (pending)"
          : "Authority (rejected)",
    admin: "Administrator",
  } as const;

  return (
    <UserMenu
      fullName={profile.full_name}
      email={user.email ?? ""}
      dashboardHref={getPostAuthRedirect(profile)}
      roleLabel={roleLabels[profile.role]}
    />
  );
}
