"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = [
  { label: "Submitted", description: "Citizen captures evidence" },
  { label: "Verified", description: "Authority confirms incident" },
  { label: "Assigned", description: "Response team dispatched" },
  { label: "Resolved", description: "Before & after documented" },
] as const;

function StepCard({
  step,
  index,
  ornate = false,
}: {
  step: (typeof steps)[number];
  index: number;
  ornate?: boolean;
}) {
  return (
    <article className="landing-lifecycle-card bg-muted/30">
      {ornate ? (
        <svg
          className="landing-lifecycle-frame"
          viewBox="0 0 280 148"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect
            className="landing-lifecycle-frame-path"
            x="1.5"
            y="1.5"
            width="277"
            height="145"
            rx="14"
            ry="14"
            pathLength="1000"
            fill="none"
          />
          <rect
            className="landing-lifecycle-frame-tail"
            x="1.5"
            y="1.5"
            width="277"
            height="145"
            rx="14"
            ry="14"
            pathLength="1000"
            fill="none"
          />
        </svg>
      ) : null}
      <div className="landing-lifecycle-card-body">
        <span className="landing-lifecycle-step">
          {ornate ? (
            <span className="landing-lifecycle-step-dot" aria-hidden>
              <span className="landing-lifecycle-step-ping" />
            </span>
          ) : null}
          Step {index + 1}
        </span>
        <p className="mt-2 font-semibold">{step.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
      </div>
    </article>
  );
}

function StepSequence({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      className="landing-lifecycle-group"
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : "Incident lifecycle steps"}
    >
      {steps.map((step, index) => (
        <li
          key={`${step.label}-${index}`}
          className="landing-lifecycle-item"
          style={
            { "--orbit-delay": `${index * 0.7}s` } as React.CSSProperties
          }
        >
          <StepCard step={step} index={index} ornate />
          <span className="landing-lifecycle-connector" aria-hidden>
            <ChevronRight className="size-4" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LifecycleSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionQuery.matches) {
      setReduceMotion(true);
      return;
    }

    setPageHidden(document.hidden);

    const node = viewportRef.current;
    const observer =
      node &&
      new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
      );

    if (node && observer) {
      observer.observe(node);
    }

    const onVisibility = () => {
      setPageHidden(document.hidden);
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const playing = !reduceMotion && inView && !pageHidden;

  if (reduceMotion) {
    return (
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
              <StepCard key={step.label} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" className="overflow-hidden py-14 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Transparent incident lifecycle
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every report follows a structured workflow with a full audit trail.
            Nothing is marked verified without authority action.
          </p>
        </div>
      </div>

      <div ref={viewportRef} className="landing-lifecycle-viewport mt-14">
        <div
          className={cn("landing-lifecycle-track", !playing && "is-paused")}
        >
          <StepSequence />
          <StepSequence hidden />
        </div>
      </div>
    </section>
  );
}
