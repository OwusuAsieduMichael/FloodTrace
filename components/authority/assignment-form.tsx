"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  assignIncident,
  type AssignmentActionState,
} from "@/lib/incidents/assignment-actions";
import { cn } from "@/lib/utils";

const initialState: AssignmentActionState = { error: null };

interface AssignableStaff {
  id: string;
  full_name: string | null;
}

function staffLabel(staff: AssignableStaff, currentUserId: string) {
  const name = staff.full_name?.trim() || `Officer ${staff.id.slice(0, 8).toUpperCase()}`;
  return staff.id === currentUserId ? `${name} (you)` : name;
}

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface AssignmentFormProps {
  incidentId: string;
  staff: AssignableStaff[];
  currentUserId: string;
  currentAssigneeId?: string | null;
}

export function AssignmentForm({
  incidentId,
  staff,
  currentUserId,
  currentAssigneeId,
}: AssignmentFormProps) {
  const [state, formAction, pending] = useActionState(assignIncident, initialState);
  const isReassignment = Boolean(currentAssigneeId);
  const defaultAssignee =
    currentAssigneeId && staff.some((member) => member.id === currentAssigneeId)
      ? currentAssigneeId
      : currentUserId;

  if (staff.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          No approved authority officers are available to assign.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="incidentId" value={incidentId} />

      <div className="space-y-2">
        <Label htmlFor="assigneeId">Assign to</Label>
        <select
          id="assigneeId"
          name="assigneeId"
          defaultValue={defaultAssignee}
          className={selectClassName}
        >
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {staffLabel(member, currentUserId)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignment-notes">Assignment notes</Label>
        <textarea
          id="assignment-notes"
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="Optional instructions for the responding officer."
          className={cn(
            "flex min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none",
            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : isReassignment ? "Reassign incident" : "Assign incident"}
      </Button>
    </form>
  );
}
