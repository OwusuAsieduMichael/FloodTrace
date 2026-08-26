"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { MapFilters } from "@/components/maps/map-filters";
import { MapLegend } from "@/components/maps/map-legend";
import { ALL_INCIDENT_STATUSES } from "@/lib/incidents/constants";
import type { PublicMapIncident } from "@/lib/incidents/public";
import type { IncidentStatus, IncidentType } from "@/types";

const PublicIncidentMapInner = dynamic(
  () =>
    import("@/components/maps/public-incident-map-inner").then(
      (mod) => mod.PublicIncidentMapInner
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-xl border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">Loading operations map…</p>
      </div>
    ),
  }
);

interface OperationalIncidentMapProps {
  incidents: PublicMapIncident[];
}

export function OperationalIncidentMap({ incidents }: OperationalIncidentMapProps) {
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
        statuses={ALL_INCIDENT_STATUSES}
        showingLabel="incident"
      />

      <div className="relative min-h-[480px] flex-1 overflow-hidden rounded-xl border border-border">
        <PublicIncidentMapInner
          incidents={filteredIncidents}
          detailHrefBase="/authority/incidents"
        />
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000]">
          <MapLegend />
        </div>
      </div>

      {incidents.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No primary incidents to plot yet. New citizen reports appear here after submission.
        </p>
      ) : null}
    </div>
  );
}
