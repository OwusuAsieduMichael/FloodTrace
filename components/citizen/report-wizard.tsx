"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CloudRain, Droplets, Loader2, Send } from "lucide-react";

import { BackToInterface } from "@/components/layout/back-to-interface";
import {
  CameraCapture,
  type CapturedPhoto,
} from "@/components/camera/camera-capture";
import {
  LocationCapture,
  type CapturedLocation,
} from "@/components/camera/location-capture";
import { SeverityBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INCIDENT_TYPE_LABELS } from "@/lib/incidents/constants";
import { formatIncidentType } from "@/lib/incidents/format";
import { submitIncidentReport } from "@/lib/incidents/submit-report";
import {
  enqueuePendingReport,
  isLikelyNetworkError,
  isOfflineEnvironment,
} from "@/lib/offline";
import { notifyOfflineQueueChanged } from "@/components/providers/offline-sync-provider";
import { cn } from "@/lib/utils";
import type { IncidentSeverity, IncidentType } from "@/types";

type ReportStep = "camera" | "location" | "details" | "review";

const STEPS: ReportStep[] = ["camera", "location", "details", "review"];

const STEP_LABELS: Record<ReportStep, string> = {
  camera: "Camera",
  location: "Location",
  details: "Details",
  review: "Submit",
};

const SEVERITY_OPTIONS: IncidentSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export function ReportWizard() {
  const router = useRouter();
  const [step, setStep] = useState<ReportStep>("camera");
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  function goNext() {
    const next = STEPS[stepIndex + 1];
    if (next) {
      setStep(next);
    }
  }

  function goBack() {
    const previous = STEPS[stepIndex - 1];
    if (previous) {
      setStep(previous);
    }
  }

  function handleClearPhoto() {
    if (photo?.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    setPhoto(null);
  }

  async function saveOfflineReport() {
    if (!photo || !location || !incidentType) {
      return;
    }

    await enqueuePendingReport({
      incidentType,
      severity,
      description,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      capturedAt: photo.capturedAt,
      photo: photo.file,
      photoMimeType: photo.file.type || "image/jpeg",
      photoFileName: photo.file.name || `evidence-${Date.now()}.jpg`,
    });

    notifyOfflineQueueChanged();
    toast.success("Report saved offline. It will sync when you are back online.");
    router.push("/citizen/dashboard");
    router.refresh();
  }

  async function handleSubmit() {
    if (!photo || !location || !incidentType) {
      toast.error("Complete all steps before submitting.");
      return;
    }

    if (isOfflineEnvironment()) {
      setIsSubmitting(true);

      try {
        await saveOfflineReport();
      } catch {
        toast.error("Unable to save this report offline. Try again.");
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("photo", photo.file);
    formData.append("incident_type", incidentType);
    formData.append("severity", severity);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("accuracy", String(location.accuracy));
    formData.append("captured_at", photo.capturedAt);

    try {
      const result = await submitIncidentReport(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.linkedToPrimary) {
        toast.success(
          "Report submitted as supporting evidence for a nearby incident."
        );
      } else {
        toast.success("Report submitted successfully.");
      }
      router.push(`/citizen/reports/${result.incidentId}`);
      router.refresh();
    } catch (error) {
      if (isLikelyNetworkError(error)) {
        try {
          await saveOfflineReport();
        } catch {
          toast.error("Connection lost. Unable to save this report offline.");
        }
        return;
      }

      toast.error("Unable to submit your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                index <= stepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {STEP_LABELS[item]}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-px w-6 sm:w-10",
                  index < stepIndex ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === "camera" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Capture evidence</h2>
                <p className="text-sm text-muted-foreground">
                  Take a live photo of the flood or blocked drain. Timestamps are
                  recorded automatically.
                </p>
              </div>
              <CameraCapture
                photo={photo}
                onCapture={setPhoto}
                onClear={handleClearPhoto}
              />
              <div className="flex flex-col gap-2">
                <Button type="button" className="w-full" disabled={!photo} onClick={goNext}>
                  Continue
                </Button>
                <BackToInterface
                  fallbackHref="/citizen/dashboard"
                  label="Back to dashboard"
                />
              </div>
            </div>
          ) : null}

          {step === "location" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Confirm location</h2>
                <p className="text-sm text-muted-foreground">
                  Your current area is detected automatically and attached to
                  this report.
                </p>
              </div>
              <LocationCapture location={location} onCapture={setLocation} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                  Back
                </Button>
                <Button type="button" className="flex-1" disabled={!location} onClick={goNext}>
                  Continue
                </Button>
              </div>
            </div>
          ) : null}

          {step === "details" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Incident details</h2>
                <p className="text-sm text-muted-foreground">
                  Select the incident type and severity level.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  Object.entries(INCIDENT_TYPE_LABELS) as [IncidentType, string][]
                ).map(([type, label]) => {
                  const Icon = type === "flood" ? Droplets : CloudRain;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIncidentType(type)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        incidentType === type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <Icon className="mb-2 size-5 text-primary" />
                      <p className="font-medium">{label}</p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SEVERITY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSeverity(option)}
                      className={cn(
                        "rounded-lg border px-3 py-2 transition-colors",
                        severity === option
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <SeverityBadge severity={option} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Additional details about the incident…"
                  maxLength={2000}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!incidentType}
                  onClick={goNext}
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Review and submit</h2>
                <p className="text-sm text-muted-foreground">
                  Confirm your evidence and location before sending to authorities.
                </p>
              </div>

              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.previewUrl}
                  alt="Report evidence preview"
                  className="aspect-[4/3] max-h-[min(40dvh,24rem)] w-full rounded-xl border border-border object-cover"
                />
              ) : null}

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium">
                    {incidentType ? formatIncidentType(incidentType) : "Not set"}
                  </dd>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-muted-foreground">Severity</dt>
                  <dd>
                    <SeverityBadge severity={severity} />
                  </dd>
                </div>
                <div className="rounded-lg border border-border/60 p-3 sm:col-span-2">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium">
                    {location?.locationName ||
                      (location ? "GPS location confirmed" : "Not set")}
                  </dd>
                </div>
                {description ? (
                  <div className="rounded-lg border border-border/60 p-3 sm:col-span-2">
                    <dt className="text-muted-foreground">Description</dt>
                    <dd>{description}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={goBack}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit report
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/citizen/dashboard" className="text-primary hover:underline">
          Cancel and return to dashboard
        </Link>
      </p>
    </div>
  );
}
