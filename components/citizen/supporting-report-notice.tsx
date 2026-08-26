import Link from "next/link";
import { Link2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatShortId } from "@/lib/incidents/format";

interface SupportingReportNoticeProps {
  parentIncidentId: string;
  href?: string;
}

export function SupportingReportNotice({
  parentIncidentId,
  href,
}: SupportingReportNoticeProps) {
  return (
    <Alert variant="info">
      <Link2 className="size-4" />
      <AlertTitle>Linked to a nearby report</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          This submission was matched to existing incident #
          {formatShortId(parentIncidentId)} as supporting evidence based on
          location and time.
        </span>
        <Button
          size="sm"
          variant="outline"
          render={<Link href={href ?? `/citizen/reports/${parentIncidentId}`} />}
        >
          View primary report
        </Button>
      </AlertDescription>
    </Alert>
  );
}
