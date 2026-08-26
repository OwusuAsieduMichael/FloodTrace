import { AuthShell } from "@/components/auth/auth-shell";
import { ReportWizard } from "@/components/citizen/report-wizard";

export default function CitizenReportPage() {
  return (
    <AuthShell
      title="Report an incident"
      description="Capture live camera evidence with automatic GPS and timestamp."
    >
      <ReportWizard />
    </AuthShell>
  );
}
