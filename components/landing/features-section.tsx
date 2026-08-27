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

const NEAR_RADIUS = 168;
const SECTION_SLACK = 96;
const VIEWPORT_FOCUS = 0.42;

function distanceToRect(x: number, y: number, rect: DOMRect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const [motionOn, setMotionOn] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [nearIndex, setNearIndex] = useState<number | null>(null);

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

  useEffect(() => {
    if (!motionOn) {
      return;
    }

    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const updateSpotlight = () => {
      frameRef.current = null;

      const sectionRect = section.getBoundingClientRect();
      const inView =
        sectionRect.bottom > 72 && sectionRect.top < window.innerHeight - 72;

      if (!inView) {
        setActiveIndex(null);
        setNearIndex(null);
        return;
      }

      const rects = cardRefs.current.map((card) =>
        card ? card.getBoundingClientRect() : null
      );
      const pointer = pointerRef.current;
      const pointerNearSection =
        Boolean(pointer) &&
        finePointer &&
        pointer!.x >= sectionRect.left - SECTION_SLACK &&
        pointer!.x <= sectionRect.right + SECTION_SLACK &&
        pointer!.y >= sectionRect.top - SECTION_SLACK &&
        pointer!.y <= sectionRect.bottom + SECTION_SLACK;

      let nextActive: number | null = null;
      let nextNear: number | null = null;

      if (pointer && pointerNearSection) {
        const ranked = rects
          .map((rect, index) =>
            rect
              ? { index, distance: distanceToRect(pointer.x, pointer.y, rect) }
              : null
          )
          .filter(
            (item): item is { index: number; distance: number } =>
              Boolean(item)
          )
          .sort((a, b) => a.distance - b.distance);

        const closest = ranked[0];
        const runnerUp = ranked[1];

        if (closest) {
          nextActive = closest.index;
        }

        if (
          runnerUp &&
          nextActive !== null &&
          runnerUp.distance <= NEAR_RADIUS
        ) {
          nextNear = runnerUp.index;
        }
      } else {
        const focusY = window.innerHeight * VIEWPORT_FOCUS;
        let bestIndex: number | null = null;
        let bestScore = Infinity;

        rects.forEach((rect, index) => {
          if (!rect) {
            return;
          }

          const visible =
            rect.bottom > 88 && rect.top < window.innerHeight - 88;

          if (!visible) {
            return;
          }

          const centerY = rect.top + rect.height / 2;
          const score = Math.abs(centerY - focusY);

          if (score < bestScore) {
            bestScore = score;
            bestIndex = index;
          }
        });

        nextActive = bestIndex;

        if (bestIndex !== null) {
          const ordered = rects
            .map((rect, index) => ({ index, rect }))
            .filter(
              (
                item
              ): item is { index: number; rect: DOMRect } => Boolean(item.rect)
            )
            .sort(
              (a, b) =>
                a.rect.top - b.rect.top || a.rect.left - b.rect.left
            );
          const position = ordered.findIndex((item) => item.index === bestIndex);
          const neighbor = ordered[position + 1] ?? ordered[position - 1];
          nextNear = neighbor && neighbor.index !== bestIndex ? neighbor.index : null;
        }
      }

      setActiveIndex((current) =>
        current === nextActive ? current : nextActive
      );
      setNearIndex((current) => {
        const next = nextNear === nextActive ? null : nextNear;
        return current === next ? current : next;
      });
    };

    const schedule = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(updateSpotlight);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      pointerRef.current = { x: event.clientX, y: event.clientY };
      schedule();
    };

    const onPointerLeave = () => {
      pointerRef.current = null;
      schedule();
    };

    const onScroll = () => {
      schedule();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    schedule();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [motionOn]);

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
              <article
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className={cn(
                  "landing-feature-card group",
                  activeIndex === index && "is-active",
                  nearIndex === index && activeIndex !== index && "is-near"
                )}
              >
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
