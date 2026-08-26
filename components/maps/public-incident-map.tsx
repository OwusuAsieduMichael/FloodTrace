"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import type { PublicMapIncident } from "@/lib/incidents/public";
import type { IncidentStatus, IncidentType } from "@/types";

import { MapFilters } from "./map-filters";
import { MapLegend } from "./map-legend";

const PublicIncidentMapInner = dynamic(
  () =>
    import("./public-incident-map-inner").then((mod) => mod.PublicIncidentMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  }
);

interface PublicIncidentMapProps {
  incidents: PublicMapIncident[];
}

export function PublicIncidentMap({ incidents }: PublicIncidentMapProps) {
  const [typeFilter, setTypeFilter] = useState<IncidentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (typeFilter !== "all" && incident.incident_type !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && incident.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [incidents, statusFilter, typeFilter]);

  return (
    <div className="flex flex-col gap-3">
      <MapFilters
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        visibleCount={filteredIncidents.length}
        totalCount={incidents.length}
      />

      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-border">
        <PublicIncidentMapInner incidents={filteredIncidents} />
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000]">
          <MapLegend />
        </div>
      </div>

      {incidents.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No verified incidents on the map yet. Reports appear here after authority verification.
        </p>
      ) : null}
    </div>
  );
}
