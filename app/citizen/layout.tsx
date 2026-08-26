import { AppUserMenu } from "@/components/layout/app-user-menu";
import { CitizenAppShell } from "@/components/layout/citizen-app-shell";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { OfflineSyncProvider } from "@/components/providers/offline-sync-provider";
import { requirePortalProfile } from "@/lib/auth/session";
import { getUnreadNotificationCount } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function CitizenLayout({
  children,
}: LayoutProps<"/citizen">) {
  const profile = await requirePortalProfile("citizen");

  const unread = await getUnreadNotificationCount(profile.id);

  return (
    <NotificationProvider userId={profile.id} initialUnread={unread}>
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
