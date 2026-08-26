import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function MapPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6">
        <PageHeader
          title="Live flood map"
          description="Interactive map with verified incidents, filters, and weather context."
          actions={
            <Button variant="outline" render={<Link href="/" />}>
              Back to home
            </Button>
          }
        />
        <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Leaflet map with verified public incidents — coming in Phase 11.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
