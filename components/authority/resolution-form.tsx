"use client";

import { useActionState, useState } from "react";

import {
  CameraCapture,
  type CapturedPhoto,
} from "@/components/camera/camera-capture";
import { EvidenceImage } from "@/components/media/evidence-image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  resolveIncident,
  type ResolutionActionState,
} from "@/lib/incidents/resolution-actions";
import { cn } from "@/lib/utils";

const initialState: ResolutionActionState = { error: null };

interface ResolutionFormProps {
  incidentId: string;
  beforePreviewUrl: string | null;
  beforeCapturedAt?: string;
}

export function ResolutionForm({
  incidentId,
  beforePreviewUrl,
  beforeCapturedAt,
}: ResolutionFormProps) {
  const [state, formAction, pending] = useActionState(resolveIncident, initialState);
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);

  function handleClear() {
    if (photo?.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    setPhoto(null);
  }

  function handleSubmit(formData: FormData) {
    if (photo) {
      formData.set("afterPhoto", photo.file);
      formData.set("capturedAt", photo.capturedAt);
    }

    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="incidentId" value={incidentId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Before · citizen evidence
          </p>
          <EvidenceImage
            src={beforePreviewUrl}
            alt="Original citizen evidence"
            capturedAt={beforeCapturedAt}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            After · authority evidence
          </p>
          <CameraCapture
            photo={photo}
            onCapture={setPhoto}
            onClear={handleClear}
            captureLabel="Capture after photo"
            previewAlt="After photograph of completed work"
            helperText="Live camera capture of completed work is required. Gallery uploads are not accepted."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resolution-description">Resolution notes</Label>
        <textarea
          id="resolution-description"
          name="description"
          required
          minLength={10}
          rows={4}
          maxLength={2000}
          placeholder="Describe the work completed. Citizens will see these notes with the before/after photographs."
          className={cn(
            "flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none",
            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
        <p className="text-xs text-muted-foreground">
          At least 10 characters. This is public accountability documentation.
        </p>
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending || !photo}>
        {pending ? "Saving…" : "Mark incident resolved"}
      </Button>
    </form>
  );
}
