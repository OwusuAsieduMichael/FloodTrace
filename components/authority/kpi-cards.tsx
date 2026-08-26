import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Layers,
  ListChecks,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthorityIncidentStats } from "@/lib/incidents/authority";

interface AuthorityKpiCardsProps {
  stats: AuthorityIncidentStats;
}

const kpis = [
  {
    key: "total" as const,
    label: "Total incidents",
    href: "/authority/incidents",
    icon: ListChecks,
  },
  {
    key: "pendingVerification" as const,
    label: "Pending verification",
    href: "/authority/incidents?status=pending",
    icon: ClipboardCheck,
  },
  {
    key: "verified" as const,
    label: "Verified",
    href: "/authority/incidents?status=verified",
    icon: ShieldCheck,
  },
  {
    key: "assigned" as const,
    label: "Assigned",
    href: "/authority/incidents?status=assigned",
    icon: Truck,
  },
  {
    key: "resolved" as const,
    label: "Resolved",
    href: "/authority/incidents?status=resolved",
    icon: CheckCircle2,
  },
  {
    key: "critical" as const,
    label: "Critical",
    href: "/authority/incidents?severity=critical",
    icon: AlertTriangle,
  },
  {
    key: "supportingReports" as const,
    label: "Supporting reports",
    href: "/authority/incidents?scope=supporting",
    icon: Layers,
  },
];

export function AuthorityKpiCards({ stats }: AuthorityKpiCardsProps) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {kpis.map(({ key, label, href, icon: Icon }) => (
        <Link key={key} href={href} className="group block">
          <Card className="h-full min-w-0 transition-shadow group-hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xs font-medium leading-tight text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
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
