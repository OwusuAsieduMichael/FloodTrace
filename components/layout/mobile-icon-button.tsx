import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface MobileIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function MobileIconButton({
  label,
  className,
  type = "button",
  ...props
}: MobileIconButtonProps) {
  return (
    <button
      type={type}
      data-slot="icon-button"
      className={cn(
        "relative z-10 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground touch-manipulation hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
      {...props}
      aria-label={label}
    />
  );
}
