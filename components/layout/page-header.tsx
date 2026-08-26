import { cn } from "@/lib/utils";

import { BackToInterface } from "@/components/layout/back-to-interface";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  /** Restore the previous screen, or this href when there is no in-app history. */
  backFallbackHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  backFallbackHref,
  backLabel = "Back",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {backFallbackHref ? (
          <BackToInterface fallbackHref={backFallbackHref} label={backLabel} />
        ) : null}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
