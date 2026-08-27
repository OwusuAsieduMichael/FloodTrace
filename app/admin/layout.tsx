import { AppUserMenu } from "@/components/layout/app-user-menu";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { requirePortalSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const { profile, email } = await requirePortalSession("admin");

  return (
    <AdminAppShell userMenu={<AppUserMenu profile={profile} email={email} />}>
      {children}
    </AdminAppShell>
  );
}
