import type { NamedCount } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface AnalyticsBarListProps {
  items: NamedCount[];
  emptyLabel?: string;
  colorClassName?: (key: string) => string;
}

export function AnalyticsBarList({
  items,
  emptyLabel = "No incidents in this period.",
  colorClassName,
}: AnalyticsBarListProps) {
  const max = Math.max(0, ...items.map((item) => item.count));
  const total = items.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const width = max > 0 ? Math.round((item.count / max) * 100) : 0;

        return (
          <li key={item.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>{item.label}</span>
              <span className="tabular-nums text-muted-foreground">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary",
                  colorClassName?.(item.key)
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
