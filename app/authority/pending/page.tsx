import { Clock3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AuthorityPendingPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Approval pending
      </h1>
      <Card>
        <CardHeader className="text-center">
          <span className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock3 className="size-6" />
          </span>
          <CardDescription>
            Your authority account
            {profile?.full_name ? ` for ${profile.full_name}` : ""} is awaiting
            admin review.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          You will receive access to the operations dashboard once an
          administrator approves your registration. Check back later or contact
          your municipal administrator if this takes longer than expected.
        </CardContent>
      </Card>
    </div>
  );
}
