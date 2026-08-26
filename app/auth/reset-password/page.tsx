import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Enter a strong password for your FloodTrace account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
