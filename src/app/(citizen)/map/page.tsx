"use client";

import { useQuery } from "@tanstack/react-query";
import { IncidentMap } from "@/components/map/incident-map";
import { getIncidents } from "@/lib/firebase/incidents";

export default function MapPage() {
  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: getIncidents,
  });

  return (
    <div className="h-full w-full">
      <IncidentMap incidents={incidents ?? []} />
    </div>
  );
}
