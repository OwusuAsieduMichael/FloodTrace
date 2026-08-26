"use client";

import { useState } from "react";

import { EvidenceImage } from "@/components/media/evidence-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ComparisonMode = "slider" | "side-by-side";

interface BeforeAfterComparisonProps {
  beforeSrc: string | null;
  afterSrc: string | null;
  beforeLabel?: string;
  afterLabel?: string;
  beforeCapturedAt?: string;
  afterCapturedAt?: string;
}

export function BeforeAfterComparison({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  beforeCapturedAt,
  afterCapturedAt,
}: BeforeAfterComparisonProps) {
  const [mode, setMode] = useState<ComparisonMode>("slider");
  const [position, setPosition] = useState(50);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "slider" ? "default" : "outline"}
          onClick={() => setMode("slider")}
        >
          Slider
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "side-by-side" ? "default" : "outline"}
          onClick={() => setMode("side-by-side")}
        >
          Side by side
        </Button>
      </div>

      {mode === "side-by-side" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {beforeLabel}
            </p>
            <EvidenceImage
              src={beforeSrc}
              alt="Citizen evidence before response"
              capturedAt={beforeCapturedAt}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {afterLabel}
            </p>
            <EvidenceImage
              src={afterSrc}
              alt="Authority evidence after response"
              capturedAt={afterCapturedAt}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
            {afterSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={afterSrc}
                alt="Authority evidence after response"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                After photo unavailable
              </div>
            )}

            {beforeSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={beforeSrc}
                alt="Citizen evidence before response"
                className="absolute inset-0 size-full object-cover"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
              />
            ) : null}

            <div
              className="absolute inset-y-0 z-10 w-px bg-white shadow-sm"
              style={{ left: `${position}%` }}
              aria-hidden
            />

            <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
              {beforeLabel}
            </span>
            <span className="absolute right-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
              {afterLabel}
            </span>

            <input
              type="range"
              min={0}
              max={100}
              value={position}
              onChange={(event) => setPosition(Number(event.target.value))}
              aria-label="Compare before and after photographs"
              className={cn(
                "absolute inset-0 z-20 m-0 h-full w-full cursor-ew-resize appearance-none bg-transparent",
                "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary",
                "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary"
              )}
            />
          </div>
          {beforeCapturedAt || afterCapturedAt ? (
            <p className="text-xs text-muted-foreground">
              {beforeCapturedAt ? `Before ${beforeCapturedAt}` : null}
              {beforeCapturedAt && afterCapturedAt ? " · " : null}
              {afterCapturedAt ? `After ${afterCapturedAt}` : null}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
