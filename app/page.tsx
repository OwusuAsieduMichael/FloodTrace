import Link from "next/link";
import {
  Camera,
  MapPin,
  ShieldCheck,
  CloudRain,
  ArrowRight,
  Radio,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Camera,
    title: "Camera-verified reporting",
    description:
      "Capture live photo evidence with automatic timestamps. Reports are structured and verifiable from the moment they are submitted.",
  },
  {
    icon: MapPin,
    title: "Automatic GPS location",
    description:
      "Your location is detected automatically — no manual coordinate entry. Authorities see exactly where incidents occur.",
  },
  {
    icon: ShieldCheck,
    title: "Authority verification",
    description:
      "Every incident is reviewed by municipal authorities before it appears publicly. Transparent status tracking from submission to resolution.",
  },
  {
    icon: CloudRain,
    title: "Real-time conditions",
    description:
      "View verified incidents on an interactive map with weather context, filters, and live community reporting.",
  },
];

const steps = [
  { label: "Submitted", description: "Citizen captures evidence" },
  { label: "Verified", description: "Authority confirms incident" },
  { label: "Assigned", description: "Response team dispatched" },
  { label: "Resolved", description: "Before & after documented" },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.45_0.12_230/0.12),transparent)]"
            aria-hidden
          />
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6">
                Disaster Management Information System
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Report Floods. Verify Reality. Protect Communities.
              </h1>
              <p className="mt-5 text-base text-muted-foreground text-pretty sm:mt-6 sm:text-xl">
                FloodTrace enables citizens to report floods and blocked drainage
                with live camera evidence while authorities verify, assign, and
                resolve incidents with full transparency.
              </p>
              <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
                <Button size="lg" className="w-full sm:w-auto" render={<Link href="/auth/signup" />}>
                  Report an Incident
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  render={<Link href="/map" />}
                >
                  <Radio className="size-4" aria-hidden />
                  View Live Map
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-border py-14 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Built for citizens and authorities
              </h2>
              <p className="mt-4 text-muted-foreground">
                A complete incident lifecycle — from camera capture to verified
                resolution — designed for urban flood and drainage management.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="how-it-works" className="py-14 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Transparent incident lifecycle
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every report follows a structured workflow with a full audit
                trail. Nothing is marked verified without authority action.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step.label}
                  className="relative rounded-xl border border-border bg-muted/30 p-5 text-center"
                >
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <p className="mt-2 font-semibold">{step.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
