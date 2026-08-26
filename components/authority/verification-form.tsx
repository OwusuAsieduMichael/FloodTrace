"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  decideIncidentVerification,
  type VerificationActionState,
} from "@/lib/incidents/verification-actions";
import { cn } from "@/lib/utils";

const initialState: VerificationActionState = { error: null };

interface VerificationDecisionFormProps {
  incidentId: string;
  defaultDecision?: "verify" | "reject";
}

export function VerificationDecisionForm({
  incidentId,
  defaultDecision = "verify",
}: VerificationDecisionFormProps) {
  const [state, formAction, pending] = useActionState(
    decideIncidentVerification,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="incidentId" value={incidentId} />

      <div className="space-y-2">
        <Label htmlFor="verification-notes">Notes</Label>
        <textarea
          id="verification-notes"
          name="notes"
          rows={4}
          maxLength={2000}
          placeholder={
            defaultDecision === "reject"
              ? "Explain why this report is not verified. Citizens will see this."
              : "Optional verification notes. If provided, citizens can see this feedback."
          }
          className={cn(
            "flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none",
            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
        <p className="text-xs text-muted-foreground">
          Rejection requires a reason (at least 10 characters). Verify notes are optional.
        </p>
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          name="decision"
          value="verify"
          disabled={pending}
          variant={defaultDecision === "reject" ? "outline" : "default"}
        >
          {pending ? "Saving…" : "Verify report"}
        </Button>
        <Button
          type="submit"
          name="decision"
          value="reject"
          disabled={pending}
          variant="destructive"
        >
          {pending ? "Saving…" : "Reject report"}
        </Button>
      </div>
    </form>
  );
}
