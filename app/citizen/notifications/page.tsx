import { NotificationInbox } from "@/components/notifications/notification-inbox";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentProfile } from "@/lib/auth/session";
import { getNotifications } from "@/lib/notifications";

export const metadata = {
  title: "Notifications",
  description: "Updates on your reports, rainfall, and incident activity.",
};

export default async function CitizenNotificationsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const notifications = await getNotifications(profile.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Updates on your reports, rainfall warnings, and incident activity."
      />
      <NotificationInbox notifications={notifications} role="citizen" />
    </div>
  );
}
