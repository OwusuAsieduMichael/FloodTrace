"use client";

import { useQuery } from "@tanstack/react-query";
import { IncidentMap, STATUS_COLOR } from "@/components/map/incident-map";
import { getIncidents } from "@/lib/firebase/incidents";
import { STATUS_LABEL } from "@/lib/incident-status";
import type { IncidentStatus } from "@/types/domain";

const LEGEND_ORDER: IncidentStatus[] = [
  "SUBMITTED",
  "PENDING_REVIEW",
  "VERIFIED",
  "ASSIGNED",
  "RESOLVED",
  "REJECTED",
];

export default function MapPage() {
  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: getIncidents,
  });

  return (
    <div className="relative h-full w-full">
      <IncidentMap incidents={incidents ?? []} />

      <div className="pointer-events-none absolute top-3 left-3 flex max-w-40 flex-wrap gap-x-3 gap-y-1 rounded-lg bg-background/90 px-3 py-2 text-xs shadow-sm ring-1 ring-foreground/10 backdrop-blur-md">
        {LEGEND_ORDER.map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[status] }}
            />
            <span className="text-muted-foreground">
              {STATUS_LABEL[status]}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
