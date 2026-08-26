"use client";

import type { ReactNode } from "react";

import { INCIDENT_TYPE_LABELS, PUBLIC_MAP_STATUSES, TIMELINE_LABELS } from "@/lib/incidents/constants";
import { Badge } from "@/components/ui/badge";
import type { IncidentStatus, IncidentType } from "@/types";

interface MapFiltersProps {
  typeFilter: IncidentType | "all";
  statusFilter: IncidentStatus | "all";
  onTypeChange: (value: IncidentType | "all") => void;
  onStatusChange: (value: IncidentStatus | "all") => void;
  visibleCount: number;
  totalCount: number;
  statuses?: IncidentStatus[];
  showingLabel?: string;
}

export function MapFilters({
  typeFilter,
  statusFilter,
  onTypeChange,
  onStatusChange,
  visibleCount,
  totalCount,
  statuses = PUBLIC_MAP_STATUSES,
  showingLabel = "verified incident",
}: MapFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/95 p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center">
      <p className="text-xs text-muted-foreground">
        Showing {visibleCount} of {totalCount} {showingLabel}
        {totalCount === 1 ? "" : "s"}
      </p>

      <div className="flex flex-wrap gap-2">
        <FilterGroup label="Type">
          <FilterChip active={typeFilter === "all"} onClick={() => onTypeChange("all")}>
            All
          </FilterChip>
          {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((type) => (
            <FilterChip
              key={type}
              active={typeFilter === type}
              onClick={() => onTypeChange(type)}
            >
              {INCIDENT_TYPE_LABELS[type]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Status">
          <FilterChip active={statusFilter === "all"} onClick={() => onStatusChange("all")}>
            All
          </FilterChip>
          {statuses.map((status) => (
            <FilterChip
              key={status}
              active={statusFilter === status}
              onClick={() => onStatusChange(status)}
            >
              {TIMELINE_LABELS[status]}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}>
      <Badge variant={active ? "default" : "outline"} className="cursor-pointer">
        {children}
      </Badge>
    </button>
  );
}
