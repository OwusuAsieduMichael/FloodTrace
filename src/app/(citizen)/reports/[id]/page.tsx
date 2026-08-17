"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, MapPin, Users, X } from "lucide-react";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getIncident } from "@/lib/firebase/incidents";
import { STATUS_LABEL, STATUS_LADDER, STATUS_VARIANT } from "@/lib/incident-status";
import { cn } from "@/lib/utils";
import type { IncidentReport } from "@/types/domain";

function formatTime(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildTimeline(report: IncidentReport) {
  if (report.status === "REJECTED") {
    return [
      { label: "Submitted", reached: true, detail: formatTime(report.createdAt) },
      { label: "Rejected", reached: true, detail: formatTime(report.updatedAt), destructive: true },
    ];
  }

  const currentIndex = STATUS_LADDER.indexOf(report.status);
  const detailFor: Record<(typeof STATUS_LADDER)[number], string | undefined> = {
    SUBMITTED: formatTime(report.createdAt),
    PENDING_REVIEW: undefined,
    VERIFIED: report.verifiedBy ? "Verified by authority" : undefined,
    ASSIGNED: report.assignedTo ? "Response team assigned" : undefined,
    RESOLVED: report.resolvedAt ? formatTime(report.resolvedAt) : undefined,
  };

  return STATUS_LADDER.map((status, i) => ({
    label: STATUS_LABEL[status],
    reached: i <= currentIndex,
    detail: i <= currentIndex ? detailFor[status] : undefined,
  }));
}

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
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <p className="p-4 text-sm text-muted-foreground">Report not found.</p>
    );
  }

  const timeline = buildTimeline(report);
  const supportingCount = report.supportingReportIds.length;

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-3"
      >
        <Card className="overflow-hidden">
          {report.photoUrls[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.photoUrls[0]}
              alt="Reported flooding"
              className="h-56 w-full object-cover"
            />
          )}
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{report.municipality}</CardTitle>
            <Badge variant={STATUS_VARIANT[report.status]}>
              {STATUS_LABEL[report.status]}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed">{report.description}</p>
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {timeline.map((stage, i) => (
                <div key={stage.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full",
                        stage.reached
                          ? "destructive" in stage && stage.destructive
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-primary text-primary-foreground"
                          : "border-2 border-input bg-background",
                      )}
                    >
                      {stage.reached &&
                        ("destructive" in stage && stage.destructive ? (
                          <X className="size-3" />
                        ) : (
                          <Check className="size-3" />
                        ))}
                    </span>
                    {i < timeline.length - 1 && (
                      <span
                        className={cn(
                          "w-0.5 flex-1 min-h-6",
                          stage.reached ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                  <div className={cn("pb-5", i === timeline.length - 1 && "pb-0")}>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        !stage.reached && "text-muted-foreground",
                      )}
                    >
                      {stage.label}
                    </p>
                    {stage.detail && (
                      <p className="text-xs text-muted-foreground">
                        {stage.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {supportingCount > 0 && (
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                Supporting reports
              </div>
              <span className="text-sm font-semibold">
                {supportingCount} others confirmed
              </span>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
