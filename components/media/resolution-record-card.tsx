import { BeforeAfterComparison } from "@/components/media/before-after-comparison";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIncidentDate } from "@/lib/incidents/format";
import type { ResolutionDocumentation } from "@/lib/incidents/resolutions";

interface ResolutionRecordCardProps {
  documentation: ResolutionDocumentation;
  title?: string;
}

export function ResolutionRecordCard({
  documentation,
  title = "Resolution",
}: ResolutionRecordCardProps) {
  const { record, authority_name, before, after } = documentation;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          Documented {formatIncidentDate(record.resolved_at)}
          {authority_name ? ` · ${authority_name}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BeforeAfterComparison
          beforeSrc={before?.display_url ?? null}
          afterSrc={after?.display_url ?? null}
          beforeCapturedAt={
            before ? formatIncidentDate(before.captured_at) : undefined
          }
          afterCapturedAt={after ? formatIncidentDate(after.captured_at) : undefined}
        />
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Resolution notes
          </p>
          <p className="text-sm leading-relaxed">{record.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
