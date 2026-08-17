"use client";

import { useQuery } from "@tanstack/react-query";
import { Droplets } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IncidentMap, STATUS_COLOR } from "@/components/map/incident-map";
import { getIncidents } from "@/lib/firebase/incidents";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/incident-status";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { IncidentStatus } from "@/types/domain";

const FILTERABLE_STATUSES: IncidentStatus[] = [
  "VERIFIED",
  "PENDING_REVIEW",
  "RESOLVED",
];

export default function PublicMapPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | null>(null);

  const { data: incidents, isLoading, isError } = useQuery({
    queryKey: ["incidents"],
    queryFn: getIncidents,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (incidents ?? []).filter((incident) => {
      if (statusFilter && incident.status !== statusFilter) return false;
      if (!q) return true;
      return (
        incident.municipality.toLowerCase().includes(q) ||
        incident.description.toLowerCase().includes(q) ||
        incident.id.toLowerCase().includes(q)
      );
    });
  }, [incidents, search, statusFilter]);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between bg-gradient-to-r from-brand-from to-brand-to px-6 py-3 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-white/15">
            <Droplets className="size-4" />
          </span>
          <span className="text-sm font-semibold">FloodTrace</span>
          <span className="text-xs opacity-80">Public Map</span>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href={user ? "/home" : "/login"}>
            {user ? "Open app" : "Sign in"}
          </Link>
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r border-border/60 bg-card p-5">
          <Input
            placeholder="Search location or incident ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Filter by status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FILTERABLE_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter((cur) => (cur === status ? null : status))
                  }
                >
                  <Badge
                    variant={
                      statusFilter === status ? STATUS_VARIANT[status] : "outline"
                    }
                    className="cursor-pointer"
                  >
                    {STATUS_LABEL[status]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Active incidents — {filtered.length}
            </p>
            <div className="flex flex-col gap-2">
              {isLoading && (
                <p className="text-sm text-muted-foreground">Loading…</p>
              )}
              {isError && (
                <p className="text-sm text-destructive">
                  Couldn&apos;t load incidents.
                </p>
              )}
              {filtered.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-lg border border-border px-3.5 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{incident.municipality}</p>
                    <span
                      className={cn("size-2 shrink-0 rounded-full")}
                      style={{ backgroundColor: STATUS_COLOR[incident.status] }}
                    />
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {STATUS_LABEL[incident.status]}
                    {incident.supportingReportIds.length > 0 &&
                      ` · ${incident.supportingReportIds.length + 1} reports`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="relative min-h-64">
          <IncidentMap incidents={filtered} />
        </div>
      </div>
    </div>
  );
}
