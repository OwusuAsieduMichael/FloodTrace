"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CloudRain, MapPin, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

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
      "Your location is detected automatically. No manual coordinate entry. Authorities see exactly where incidents occur.",
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
] as const;

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [motionOn, setMotionOn] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setRevealed(true);
      return;
    }

    const node = sectionRef.current;
    if (!node) {
      return;
    }

    setMotionOn(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const revealClass = cn(
    "landing-reveal",
    motionOn && !revealed && "landing-reveal-pending",
    revealed && "landing-reveal-in"
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="landing-features border-b border-border py-14 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn("mx-auto max-w-2xl text-center", revealClass)}
          style={{ "--landing-delay": "0ms" } as React.CSSProperties}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Built for citizens and authorities
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete incident lifecycle, from camera capture to verified
            resolution, designed for urban flood and drainage management.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={revealClass}
              style={
                {
                  "--landing-delay": `${120 + index * 90}ms`,
                } as React.CSSProperties
              }
            >
              <article className="landing-feature-card group">
                <span className="landing-feature-card-accent" aria-hidden />
                <div className="landing-feature-icon bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
