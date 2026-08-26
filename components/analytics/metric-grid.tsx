import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AnalyticsMetric {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

interface AnalyticsMetricGridProps {
  metrics: AnalyticsMetric[];
  className?: string;
}

export function AnalyticsMetricGrid({ metrics, className }: AnalyticsMetricGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {metrics.map(({ label, value, hint, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-xs font-medium leading-tight text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            {hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
