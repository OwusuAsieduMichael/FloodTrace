import { AppUserMenu } from "@/components/layout/app-user-menu";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { requirePortalProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const profile = await requirePortalProfile("admin");

  return (
    <AdminAppShell userMenu={<AppUserMenu />}>{children}</AdminAppShell>
  );
}
