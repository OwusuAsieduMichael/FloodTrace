"use client";

import { useEffect, useState } from "react";

import { formatIncidentLocation } from "@/lib/incidents/format";
import { cn } from "@/lib/utils";

interface IncidentLocationLabelProps {
  locationName: string | null | undefined;
  latitude: number;
  longitude: number;
  className?: string;
  lookupMissing?: boolean;
}

export function IncidentLocationLabel({
  locationName,
  latitude,
  longitude,
  className,
  lookupMissing = true,
}: IncidentLocationLabelProps) {
  const known = locationName?.trim() || null;
  const [label, setLabel] = useState(known ?? "");
  const [pending, setPending] = useState(!known);

  useEffect(() => {
    const existing = locationName?.trim();

    if (existing) {
      setLabel(existing);
      setPending(false);
      return;
    }

    if (!lookupMissing) {
      setLabel(formatIncidentLocation(null));
      setPending(false);
      return;
    }

    let cancelled = false;
    setPending(true);

    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
    });

    void fetch(`/api/geo/reverse?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as { name?: string | null };
        return data.name?.trim() || null;
      })
      .then((name) => {
        if (cancelled) {
          return;
        }

        setLabel(name ?? formatIncidentLocation(null));
        setPending(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLabel(formatIncidentLocation(null));
          setPending(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [locationName, latitude, longitude, lookupMissing]);

  if (pending && !label) {
    return (
      <span className={cn("text-muted-foreground", className)}>Finding area…</span>
    );
  }

  return <span className={className}>{label || formatIncidentLocation(null)}</span>;
}
