"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ClipboardList, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserIncidents } from "@/lib/firebase/incidents";
import { STATUS_LABEL, STATUS_VARIANT } from "@/lib/incident-status";
import { useAuth } from "@/providers/auth-provider";

export default function ReportsPage() {
  const { user } = useAuth();
  const { data: reports, isLoading } = useQuery({
    queryKey: ["incidents", user?.uid],
    queryFn: () => getUserIncidents(user!.uid),
    enabled: !!user,
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          My reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Track the status of what you&apos;ve reported.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && reports?.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="size-6" />
          </span>
          <p className="text-sm font-medium">No reports yet</p>
          <p className="max-w-56 text-sm text-muted-foreground">
            Reports you submit will show up here so you can track their
            status.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reports?.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <Link href={`/reports/${report.id}`}>
              <Card className="transition-shadow hover:shadow-md hover:ring-primary/20">
                <CardContent className="flex items-center gap-3 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{report.municipality}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[report.status]}>
                    {STATUS_LABEL[report.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
