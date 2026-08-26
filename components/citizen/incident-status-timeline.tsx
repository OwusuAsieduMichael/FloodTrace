import { CheckCircle2, Circle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { TIMELINE_LABELS, TIMELINE_STATUSES } from "@/lib/incidents";
import type { IncidentStatus } from "@/types";

interface IncidentStatusTimelineProps {
  currentStatus: IncidentStatus;
}

function getTimelineIndex(status: IncidentStatus): number {
  if (status === "rejected") {
    return -1;
  }

  const index = TIMELINE_STATUSES.indexOf(status);
  return index >= 0 ? index : 0;
}

export function IncidentStatusTimeline({
  currentStatus,
}: IncidentStatusTimelineProps) {
  const currentIndex = getTimelineIndex(currentStatus);
  const isRejected = currentStatus === "rejected";

  if (isRejected) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-4" />
          </span>
          <div>
            <p className="font-medium">Report rejected</p>
            <p className="text-sm text-muted-foreground">
              This report was not verified by authorities. Check authority
              feedback below for details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {TIMELINE_STATUSES.map((status, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={status} className="relative flex gap-3 pb-6 last:pb-0">
            {index < TIMELINE_STATUSES.length - 1 ? (
              <span
                className={cn(
                  "absolute left-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2",
                  isComplete ? "bg-primary" : "bg-border"
                )}
                aria-hidden
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                isComplete && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary bg-primary/10 text-primary",
                !isComplete && !isCurrent && "border-border bg-background text-muted-foreground"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Circle className="size-3.5" />
              )}
            </span>

            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "font-medium",
                  isCurrent ? "text-primary" : "text-foreground"
                )}
              >
                {TIMELINE_LABELS[status]}
              </p>
              {isCurrent ? (
                <p className="text-sm text-muted-foreground">Current status</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
