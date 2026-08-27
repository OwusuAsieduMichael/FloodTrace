import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ContinueRetry } from "@/components/auth/continue-retry";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveAuthHandoff } from "@/lib/auth/ensure-profile";
import { AUTH_CONTINUE_PATH } from "@/lib/auth/handoff";
import { isSafeInternalPath } from "@/lib/security/safe-path";

export const dynamic = "force-dynamic";

export default async function AuthContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; attempt?: string }>;
}) {
  const params = await searchParams;
  const requestedNext = isSafeInternalPath(params.next) ? params.next : null;
  const destination = await resolveAuthHandoff(requestedNext);

  if (destination) {
    redirect(destination);
  }

  const attempt = Number(params.attempt ?? "0");

  return (
    <AuthShell
      title="Opening your workspace"
      description="Your sign-in succeeded. Connecting you to FloodTrace now."
    >
      {attempt >= 6 ? (
        <Card>
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your session is ready, but your workspace is still being prepared.
              Try again in a moment.
            </p>
            <Button className="h-11 w-full text-base sm:h-9 sm:text-sm" render={<Link href={AUTH_CONTINUE_PATH} />}>
              Continue to workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ContinueRetry />
      )}
    </AuthShell>
  );
}
