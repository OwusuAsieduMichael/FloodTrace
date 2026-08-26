import { getCurrentProfile } from "@/lib/auth/session";
import { getEmergencyContacts } from "@/lib/config/app-config";
import {
  getCitizenIncidentStats,
  getCitizenRecentIncidents,
  getPublicActiveIncidentCount,
} from "@/lib/incidents";
import { getUnreadNotificationCount, maybeCreateRainfallWarning } from "@/lib/notifications";
import { getWeather } from "@/lib/weather";
import { CitizenQuickLinks, NearbyIncidentsCard } from "@/components/citizen/dashboard-extras";
import { EmergencyContactsPanel, ReportHeroCta } from "@/components/citizen/emergency-contacts-panel";
import { OfflineSyncBanner } from "@/components/citizen/offline-sync-banner";
import { RecentReportsSection } from "@/components/citizen/recent-reports-list";
import { ReportStatCards } from "@/components/citizen/report-stat-cards";
import { PageHeader } from "@/components/layout/page-header";

export default async function CitizenDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const [
    stats,
    recentIncidents,
    emergencyContacts,
    activeIncidentCount,
    weather,
  ] = await Promise.all([
    getCitizenIncidentStats(profile.id),
    getCitizenRecentIncidents(profile.id),
    getEmergencyContacts(),
    getPublicActiveIncidentCount(),
    getWeather(),
  ]);

  if (weather.ok) {
    await maybeCreateRainfallWarning(profile.id, weather.data);
  }

  const unreadNotifications = await getUnreadNotificationCount(profile.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={
          profile.full_name
            ? `Welcome back, ${profile.full_name}. Report incidents and track their status.`
            : "Report incidents and track their status from your citizen dashboard."
        }
      />

      <ReportHeroCta />
      <OfflineSyncBanner />
      <ReportStatCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentReportsSection incidents={recentIncidents} />
        </div>

        <div className="space-y-6">
          <NearbyIncidentsCard activeCount={activeIncidentCount} />
          <CitizenQuickLinks
            unreadNotifications={unreadNotifications}
            weather={weather}
          />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Emergency assistance</h2>
        <EmergencyContactsPanel contacts={emergencyContacts} compact />
      </section>
    </div>
  );
}
