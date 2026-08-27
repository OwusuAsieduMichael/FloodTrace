import { AppUserMenu } from "@/components/layout/app-user-menu";
import { AuthorityAppShell } from "@/components/layout/authority-app-shell";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { requirePortalSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AuthorityLayout({
  children,
}: LayoutProps<"/authority">) {
  const { profile, email } = await requirePortalSession("authority");

  const isOperational = profile.authority_status === "approved";
  const roleLabel =
    profile.authority_status === "approved"
      ? "Authority"
      : profile.authority_status === "pending"
        ? "Authority (pending)"
        : "Authority (rejected)";

  const homeHref =
    profile.authority_status === "approved"
      ? "/authority/dashboard"
      : profile.authority_status === "rejected"
        ? "/authority/rejected"
        : "/authority/pending";

  return (
    <NotificationProvider userId={profile.id} initialUnread={0}>
      <AuthorityAppShell
        roleLabel={roleLabel}
        homeHref={homeHref}
        limited={!isOperational}
        userMenu={<AppUserMenu profile={profile} email={email} />}
      >
        {children}
      </AuthorityAppShell>
    </NotificationProvider>
  );
}
