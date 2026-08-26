import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface EvidenceImageProps {
  src: string | null;
  alt: string;
  capturedAt?: string;
  className?: string;
}

export function EvidenceImage({
  src,
  alt,
  capturedAt,
  className,
}: EvidenceImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground",
          className
        )}
      >
        <ImageOff className="size-8 opacity-60" />
        <p className="text-sm">Evidence unavailable</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-80 w-full rounded-lg border border-border object-cover"
      />
      {capturedAt ? (
        <p className="text-xs text-muted-foreground">Captured {capturedAt}</p>
      ) : null}
    </div>
  );
}
