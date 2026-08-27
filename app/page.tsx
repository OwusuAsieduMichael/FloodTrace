import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";

import { FeaturesSection } from "@/components/landing/features-section";
import { LifecycleSection } from "@/components/landing/lifecycle-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <Image
            src="/FLOOD.jpg"
            alt="Floodwaters approaching a city skyline"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/60 to-black/80"
            aria-hidden
          />
          <div className="relative z-[2] mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28 lg:py-36">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="secondary"
                className="mb-6 border-white/20 bg-white/15 text-white"
              >
                Disaster Management Information System
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Report Floods. Verify Reality. Protect Communities.
              </h1>
              <p className="mt-5 text-base text-white/80 sm:mt-6 sm:text-xl">
                FloodTrace enables citizens to report floods and blocked drainage
                with live camera evidence while authorities verify, assign, and
                resolve incidents with full transparency.
              </p>
              <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
                <Button size="lg" className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm" render={<Link href="/auth/signup" />}>
                  Report an Incident
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto"
                  render={<Link href="/map" />}
                >
                  <Radio className="size-4" aria-hidden />
                  View Live Map
                </Button>
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection />

        <LifecycleSection />

        {/* CTA */}
        <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to protect your community?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join as a citizen to report incidents, or register as an authority
              to verify and manage flood response operations.
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="w-full sm:w-auto" render={<Link href="/auth/signup" />}>
                Get started free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                render={<Link href="/map" />}
              >
                Explore the map
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
