import { AppUserMenu } from "@/components/layout/app-user-menu";
import { CitizenAppShell } from "@/components/layout/citizen-app-shell";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { OfflineSyncProvider } from "@/components/providers/offline-sync-provider";
import { requirePortalProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CitizenLayout({
  children,
}: LayoutProps<"/citizen">) {
  const profile = await requirePortalProfile("citizen");

  return (
    <NotificationProvider userId={profile.id} initialUnread={0}>
      <OfflineSyncProvider>
        <CitizenAppShell
          fullName={profile.full_name}
          userMenu={<AppUserMenu />}
        >
          {children}
        </CitizenAppShell>
      </OfflineSyncProvider>
    </NotificationProvider>
  );
}
