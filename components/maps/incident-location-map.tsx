"use client";

import dynamic from "next/dynamic";

import type { PublicMapIncident } from "@/lib/incidents/public";

const PublicIncidentMapInner = dynamic(
  () =>
    import("@/components/maps/public-incident-map-inner").then(
      (mod) => mod.PublicIncidentMapInner
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">Loading location…</p>
      </div>
    ),
  }
);

interface IncidentLocationMapProps {
  incident: Pick<
    PublicMapIncident,
    | "id"
    | "incident_type"
    | "description"
    | "latitude"
    | "longitude"
    | "location_name"
    | "severity"
    | "status"
    | "submitted_at"
  >;
}

export function IncidentLocationMap({ incident }: IncidentLocationMapProps) {
  return (
    <div className="h-[220px] overflow-hidden rounded-xl border border-border">
      <PublicIncidentMapInner
        incidents={[{ ...incident, resolved_at: null }]}
      />
    </div>
  );
}
