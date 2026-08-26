import { redirect } from "next/navigation";

import { AppUserMenu } from "@/components/layout/app-user-menu";
import { AuthorityAppShell } from "@/components/layout/authority-app-shell";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AuthorityLayout({
  children,
}: LayoutProps<"/authority">) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "authority") {
    redirect("/auth/login");
  }

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
    <AuthorityAppShell
      roleLabel={roleLabel}
      homeHref={homeHref}
      limited={!isOperational}
      userMenu={<AppUserMenu />}
    >
      {children}
    </AuthorityAppShell>
  );
}
