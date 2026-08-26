import { redirect } from "next/navigation";

import { AppUserMenu } from "@/components/layout/app-user-menu";
import { CitizenAppShell } from "@/components/layout/citizen-app-shell";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function CitizenLayout({
  children,
}: LayoutProps<"/citizen">) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "citizen") {
    redirect("/auth/login");
  }

  return (
    <CitizenAppShell
      fullName={profile.full_name}
      userMenu={<AppUserMenu />}
    >
      {children}
    </CitizenAppShell>
  );
}
