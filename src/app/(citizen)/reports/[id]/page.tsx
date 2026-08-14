"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIncident } from "@/lib/firebase/incidents";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/incident-status";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: report, isLoading } = useQuery({
    queryKey: ["incident", id],
    queryFn: () => getIncident(id),
  });

  if (isLoading) {
    return (
      <p className="p-4 text-sm text-muted-foreground">Loading report…</p>
    );
  }

  if (!report) {
    return <p className="p-4 text-sm text-muted-foreground">Report not found.</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{report.municipality}</CardTitle>
          <Badge variant={STATUS_VARIANT[report.status]}>
            {STATUS_LABEL[report.status]}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {report.photoUrls[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.photoUrls[0]}
              alt="Reported flooding"
              className="w-full rounded-md object-cover"
            />
          )}
          <p className="text-sm">{report.description}</p>
          <p className="text-xs text-muted-foreground">
            {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
