import { SEVERITY_MARKER_COLORS } from "@/lib/maps/constants";
import type { IncidentSeverity } from "@/types";

const severityLabels: Record<IncidentSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function MapLegend() {
  return (
    <div className="rounded-lg border border-border bg-background/95 p-3 shadow-sm backdrop-blur-sm">
      <p className="mb-2 text-xs font-semibold text-foreground">Severity</p>
      <ul className="space-y-1.5">
        {(Object.keys(SEVERITY_MARKER_COLORS) as IncidentSeverity[]).map((severity) => (
          <li key={severity} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="size-3 shrink-0 rounded-full border border-white/80 shadow-sm"
              style={{ backgroundColor: SEVERITY_MARKER_COLORS[severity] }}
              aria-hidden
            />
            {severityLabels[severity]}
          </li>
        ))}
      </ul>
    </div>
  );
}
