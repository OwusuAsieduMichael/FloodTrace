import { AuthShell } from "@/components/auth/auth-shell";
import { SignupWizard } from "@/components/auth/signup-wizard";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create account"
      description="Join FloodTrace as a citizen reporter or municipal authority."
    >
      <SignupWizard />
    </AuthShell>
  );
}
