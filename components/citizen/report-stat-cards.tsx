import Link from "next/link";
import { CheckCircle2, Clock3, FileText, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CitizenIncidentStats } from "@/lib/incidents";

interface ReportStatCardsProps {
  stats: CitizenIncidentStats;
}

const statConfig = [
  {
    key: "total" as const,
    label: "My reports",
    icon: FileText,
    href: "/citizen/reports",
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: Clock3,
    href: "/citizen/reports?status=pending",
  },
  {
    key: "inProgress" as const,
    label: "Verified",
    icon: ShieldCheck,
    href: "/citizen/reports?status=verified",
  },
  {
    key: "resolved" as const,
    label: "Resolved",
    icon: CheckCircle2,
    href: "/citizen/reports?status=resolved",
  },
];

export function ReportStatCards({ stats }: ReportStatCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {statConfig.map(({ key, label, icon: Icon, href }) => (
        <Link key={key} href={href} className="group block">
          <Card className="transition-shadow group-hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-primary" aria-hidden />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{stats[key]}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
