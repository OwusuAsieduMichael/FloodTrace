"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { MapWeatherChip } from "@/components/weather/map-weather-chip";
import type { PublicMapIncident } from "@/lib/incidents/public";
import type { IncidentStatus, IncidentType, WeatherData } from "@/types";

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
  weather?: WeatherData | null;
}

export function PublicIncidentMap({ incidents, weather }: PublicIncidentMapProps) {
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

      <div className="relative h-[min(70dvh,560px)] min-h-[280px] overflow-hidden rounded-xl border border-border">
        <PublicIncidentMapInner incidents={filteredIncidents} lookupMissing={false} />
        {weather ? (
          <div className="pointer-events-none absolute right-2 top-2 z-[1000] max-w-[calc(100%-1rem)] sm:right-3 sm:top-3">
            <MapWeatherChip weather={weather} />
          </div>
        ) : null}
        <div className="pointer-events-none absolute bottom-2 left-2 z-[1000] sm:bottom-3 sm:left-3">
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
