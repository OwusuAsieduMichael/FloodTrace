import { ImageOff } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { EvidenceImage } from "@/components/media/evidence-image";
import { formatIncidentDate } from "@/lib/incidents/format";
import type { IncidentMediaWithUrl } from "@/lib/storage";

interface EvidenceGalleryProps {
  media: IncidentMediaWithUrl[];
  emptyMessage?: string;
}

export function EvidenceGallery({
  media,
  emptyMessage = "No evidence media attached to this report.",
}: EvidenceGalleryProps) {
  if (media.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title="No evidence"
        description={emptyMessage}
        className="py-8"
      />
    );
  }

  return (
    <div className="space-y-4">
      {media.map((item) => (
        <EvidenceImage
          key={item.id}
          src={item.display_url}
          alt="Incident evidence"
          capturedAt={formatIncidentDate(item.captured_at)}
        />
      ))}
    </div>
  );
}
