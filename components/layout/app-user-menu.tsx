import { getPostAuthRedirect } from "@/lib/auth/redirects";
import { UserMenu } from "@/components/layout/user-menu";
import type { Profile } from "@/types";

export function AppUserMenu({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
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
      email={email}
      dashboardHref={getPostAuthRedirect(profile)}
      roleLabel={roleLabels[profile.role]}
    />
  );
}
