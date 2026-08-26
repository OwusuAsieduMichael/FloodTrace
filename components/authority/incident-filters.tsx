import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_INCIDENT_STATUSES,
  INCIDENT_TYPE_LABELS,
  SEVERITY_LABELS,
  TIMELINE_LABELS,
} from "@/lib/incidents/constants";
import type { AuthorityIncidentFilters } from "@/lib/incidents/authority";
import type { IncidentSeverity, IncidentType } from "@/types";

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface IncidentFiltersProps {
  filters: AuthorityIncidentFilters;
  resultCount: number;
  totalCount: number;
}

export function IncidentFilters({
  filters,
  resultCount,
  totalCount,
}: IncidentFiltersProps) {
  return (
    <form
      method="get"
      action="/authority/incidents"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 lg:flex-row lg:flex-wrap lg:items-end"
    >
      <label className="min-w-[220px] flex-1 space-y-1">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Search
        </span>
        <Input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="ID, location, description, assignee"
        />
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Status
        </span>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className={selectClassName}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending verification</option>
          {ALL_INCIDENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TIMELINE_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Type
        </span>
        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className={selectClassName}
        >
          <option value="">All types</option>
          {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((type) => (
            <option key={type} value={type}>
              {INCIDENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Severity
        </span>
        <select
          name="severity"
          defaultValue={filters.severity ?? ""}
          className={selectClassName}
        >
          <option value="">All severities</option>
          {(Object.keys(SEVERITY_LABELS) as IncidentSeverity[]).map((severity) => (
            <option key={severity} value={severity}>
              {SEVERITY_LABELS[severity]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Scope
        </span>
        <select
          name="scope"
          defaultValue={filters.scope ?? "primary"}
          className={selectClassName}
        >
          <option value="primary">Primary incidents</option>
          <option value="supporting">Supporting reports</option>
          <option value="all">All reports</option>
        </select>
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">
          Apply
        </Button>
        <Button variant="outline" size="sm" render={<Link href="/authority/incidents" />}>
          Reset
        </Button>
      </div>

      <p className="w-full text-xs text-muted-foreground lg:ml-auto lg:w-auto">
        Showing {resultCount} of {totalCount} loaded report{totalCount === 1 ? "" : "s"}
      </p>
    </form>
  );
}
