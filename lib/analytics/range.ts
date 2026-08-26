export const ANALYTICS_RANGES = ["7d", "30d", "90d", "all"] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const ANALYTICS_RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

export function parseAnalyticsRange(value?: string): AnalyticsRange {
  if (value && ANALYTICS_RANGES.includes(value as AnalyticsRange)) {
    return value as AnalyticsRange;
  }

  return "30d";
}

export function rangeStartIso(range: AnalyticsRange, now = new Date()): string | null {
  if (range === "all") {
    return null;
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function utcDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function formatDurationHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return minutes <= 0 ? "< 1 min" : `${minutes} min`;
  }

  if (hours < 48) {
    return `${hours.toFixed(1)} hr`;
  }

  return `${(hours / 24).toFixed(1)} days`;
}

export function formatPercent(part: number, total: number): string | null {
  if (total <= 0) {
    return null;
  }

  return `${Math.round((part / total) * 100)}%`;
}

export function hoursBetween(startIso: string, endIso: string): number {
  return (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000;
}
