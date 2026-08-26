import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase: string;
  backHref?: string;
  backLabel?: string;
}

export function PlaceholderPage({
  title,
  description,
  phase,
  backHref,
  backLabel = "Back to dashboard",
}: PlaceholderPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Construction}
        title={`Coming in ${phase}`}
        description="This section is scaffolded in the application shell and will be implemented in a later development phase."
        action={
          backHref ? (
            <Button variant="outline" render={<Link href={backHref} />}>
              {backLabel}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
