import { getPostAuthRedirect } from "@/lib/auth/redirects";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/layout/user-menu";

export async function AppUserMenu() {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
  ]);

  if (!user || !profile) {
    return null;
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
