import { NotificationInbox } from "@/components/notifications/notification-inbox";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentProfile } from "@/lib/auth/session";
import { getNotifications } from "@/lib/notifications";

export const metadata = {
  title: "Notifications",
  description: "Operational alerts for new reports, duplicates, and critical incidents.",
};

export default async function AuthorityNotificationsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const notifications = await getNotifications(profile.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Operational alerts for new reports, duplicates, and high-priority incidents."
      />
      <NotificationInbox notifications={notifications} role="authority" />
    </div>
  );
}
