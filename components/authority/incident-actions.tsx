import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  authorityIncidentHref,
  authorityWorkflowHref,
  availableWorkflowActions,
  type AuthorityWorkflowAction,
} from "@/lib/incidents/authority-href";
import type { IncidentStatus } from "@/types";

const ACTION_LABELS: Record<AuthorityWorkflowAction, string> = {
  verify: "Verify",
  reject: "Reject",
  assign: "Assign",
  resolve: "Resolve",
};

interface IncidentActionsProps {
  incidentId: string;
  status: IncidentStatus;
  compact?: boolean;
}

export function IncidentActions({
  incidentId,
  status,
  compact = false,
}: IncidentActionsProps) {
  const workflows = availableWorkflowActions(status);
  const size = compact ? "xs" : "sm";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        size={size}
        variant="outline"
        render={<Link href={authorityIncidentHref(incidentId)} />}
      >
        View
      </Button>
      {workflows.map((action) => (
        <Button
          key={action}
          size={size}
          variant={action === "reject" ? "destructive" : "secondary"}
          render={<Link href={authorityWorkflowHref(action, incidentId)} />}
        >
          {action === "assign" && status === "assigned"
            ? "Reassign"
            : ACTION_LABELS[action]}
        </Button>
      ))}
    </div>
  );
}
