import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  ANALYTICS_RANGES,
  ANALYTICS_RANGE_LABELS,
  type AnalyticsRange,
} from "@/lib/analytics";

interface AnalyticsRangeToggleProps {
  range: AnalyticsRange;
  hrefFor: (range: AnalyticsRange) => string;
}

export function AnalyticsRangeToggle({ range, hrefFor }: AnalyticsRangeToggleProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ANALYTICS_RANGES.map((value) => (
        <Button
          key={value}
          size="sm"
          variant={value === range ? "default" : "outline"}
          render={<Link href={hrefFor(value)} />}
        >
          {ANALYTICS_RANGE_LABELS[value]}
        </Button>
      ))}
    </div>
  );
}
