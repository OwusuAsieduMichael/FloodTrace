import { ShieldX } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function AuthorityRejectedPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Registration not approved
      </h1>
      <Card>
        <CardHeader className="text-center">
          <span className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="size-6" />
          </span>
          <CardDescription>
            Your authority account request was not approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          If you believe this was a mistake, contact your municipal
          administrator or FloodTrace support for assistance.
        </CardContent>
      </Card>
    </div>
  );
}
