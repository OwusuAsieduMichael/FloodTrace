import { EmergencyContactsPanel } from "@/components/citizen/emergency-contacts-panel";
import { PageHeader } from "@/components/layout/page-header";
import { getEmergencyContacts } from "@/lib/config/app-config";

export default async function CitizenEmergencyPage() {
  const contacts = await getEmergencyContacts();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Emergency assistance"
        description="Ghana emergency numbers. 112 is the national toll-free line for Police, Fire, Ambulance, and NADMO."
        backFallbackHref="/citizen/dashboard"
        backLabel="Back to dashboard"
      />
      <EmergencyContactsPanel contacts={contacts} />
    </div>
  );
}
