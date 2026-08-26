"use client";

import { Button } from "@/components/ui/button";
import { formatCooldown } from "@/lib/auth/email-cooldown";

interface ResendEmailControlProps {
  remaining: number;
  canResend: boolean;
  isSending: boolean;
  onResend: () => void;
  label: string;
  waitLabel?: string;
}

export function ResendEmailControl({
  remaining,
  canResend,
  isSending,
  onResend,
  label,
  waitLabel = "You can request another confirmation in",
}: ResendEmailControlProps) {
  const waiting = remaining > 0;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full text-base sm:h-9 sm:text-sm"
        disabled={!canResend || isSending || waiting}
        onClick={onResend}
      >
        {isSending
          ? "Sending…"
          : waiting
            ? `Resend in ${formatCooldown(remaining)}`
            : label}
      </Button>
      {waiting ? (
        <p className="text-center text-xs text-muted-foreground">
          {waitLabel} {formatCooldown(remaining)}.
        </p>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Didn&apos;t get it? Check spam, then request another code.
        </p>
      )}
    </div>
  );
}
