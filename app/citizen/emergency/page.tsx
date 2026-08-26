import { EmergencyContactsPanel } from "@/components/citizen/emergency-contacts-panel";
import { PageHeader } from "@/components/layout/page-header";
import { getEmergencyContacts } from "@/lib/config/app-config";

export default async function CitizenEmergencyPage() {
  const contacts = await getEmergencyContacts();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Emergency assistance"
        description="Quick access to configured emergency contacts for urgent assistance."
      />
      <EmergencyContactsPanel contacts={contacts} />
    </div>
  );
}
