"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex flex-1 flex-col gap-3 p-4">
      <h1 className="text-lg font-semibold">My reports</h1>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading your reports…</p>
      )}

      {!isLoading && reports?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t submitted any reports yet.
        </p>
      )}

      {reports?.map((report) => (
        <Link key={report.id} href={`/reports/${report.id}`}>
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div>
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
      ))}
    </div>
  );
}
