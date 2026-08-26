import { redirect } from "next/navigation";

import { AppUserMenu } from "@/components/layout/app-user-menu";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <AdminAppShell userMenu={<AppUserMenu />}>{children}</AdminAppShell>
  );
}
