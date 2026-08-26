import type { TrendPoint } from "@/lib/analytics";

interface AnalyticsTrendColumnsProps {
  points: TrendPoint[];
  caption: string;
}

export function AnalyticsTrendColumns({ points, caption }: AnalyticsTrendColumnsProps) {
  const max = Math.max(0, ...points.map((point) => point.count));
  const total = points.reduce((sum, point) => sum + point.count, 0);

  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No trend window available.</p>;
  }

  return (
    <div className="space-y-3">
      <div
        className="flex h-40 items-end gap-px sm:gap-0.5"
        role="img"
        aria-label={caption}
      >
        {points.map((point) => {
          const height = max > 0 ? Math.max(point.count > 0 ? 8 : 0, (point.count / max) * 100) : 0;

          return (
            <div
              key={point.key}
              className="flex min-w-0 flex-1 flex-col items-center justify-end"
              title={`${point.key}: ${point.count}`}
            >
              <div
                className="w-full rounded-t-sm bg-primary/80"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {caption}
        {total === 0 ? " No primary incidents were submitted in this window." : ""}
      </p>
    </div>
  );
}
