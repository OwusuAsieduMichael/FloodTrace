"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation } from "@/hooks/use-geolocation";
import { createIncidentReport } from "@/lib/firebase/incidents";
import { reportSchema, type ReportInput } from "@/lib/validations/report";
import { useAuth } from "@/providers/auth-provider";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export default function NewReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { location, loading: locating, error: locationError, capture } =
    useGeolocation();
  const [step, setStep] = useState<"photo" | "details">("photo");
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    capture();
    // Only auto-capture once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  );

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function onPhotoChange(file: File | null) {
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Photo must be an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Photo must be smaller than 10MB.");
      return;
    }
    setPhoto(file);
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportInput>({ resolver: zodResolver(reportSchema) });

  async function onSubmit(data: ReportInput) {
    if (!user) return;
    if (!photo) {
      toast.error("Add a photo of the flooding or drainage issue.");
      setStep("photo");
      return;
    }
    if (!location) {
      toast.error("Capture your location before submitting.");
      return;
    }

    try {
      await createIncidentReport({
        reporterId: user.uid,
        municipality: data.municipality,
        description: data.description,
        location,
        photo,
      });
      toast.success("Report submitted for review.");
      router.push("/reports");
    } catch {
      toast.error("Couldn't submit your report. Try again.");
    }
  }

  if (step === "photo") {
    return (
      <div className="flex flex-1 flex-col bg-[#0c0e10] p-4 text-white">
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={() => router.push("/home")}
            aria-label="Cancel"
            className="text-white/80 transition-colors hover:text-white"
          >
            <X className="size-5" />
          </button>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            Flood report
          </span>
          <span className="text-xs text-white/60">1 of 2</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
          className="sr-only"
        />

        <div className="relative flex-1 overflow-hidden rounded-2xl bg-black/40">
          <AnimatePresence mode="wait">
            {photoPreview ? (
              <motion.img
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={photoPreview}
                alt="Captured flooding photo"
                className="h-full w-full object-cover"
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full flex-col items-center justify-center gap-2 text-white/40"
              >
                <Camera className="size-10" />
                <span className="text-sm">Camera viewfinder</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-3 top-3 flex items-center gap-2 rounded-lg bg-black/60 px-3.5 py-2.5 backdrop-blur-sm">
            <span
              className={
                "size-2 shrink-0 rounded-full " +
                (locating ? "bg-amber-400" : location ? "bg-emerald-400" : "bg-white/40")
              }
            />
            <span className="text-xs">
              {locating
                ? "Locating…"
                : location
                  ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                  : locationError || "Location unavailable"}
            </span>
          </div>

          {!photoPreview && (
            <div className="absolute inset-x-3 bottom-3 flex justify-center">
              <span className="rounded-full bg-black/60 px-4 py-2 text-xs backdrop-blur-sm">
                Frame the flooded area clearly
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center py-6">
          {photoPreview ? (
            <div className="flex w-full items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => onPhotoChange(null)}
              >
                Retake
              </Button>
              <Button
                type="button"
                size="lg"
                className="bg-gradient-to-r from-brand-from to-brand-to px-8 text-primary-foreground"
                onClick={() => setStep("details")}
              >
                Use photo
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Take photo"
              className="flex size-[70px] items-center justify-center rounded-full border-4 border-white"
            >
              <span className="size-14 rounded-full bg-white" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-1 flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => setStep("photo")}
          aria-label="Back to photo"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <span className="text-xs text-muted-foreground">2 of 2</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="overflow-visible">
          <CardHeader>
            <div className="flex items-center gap-3">
              {photoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Selected flooding photo"
                  className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10"
                />
              )}
              <div>
                <CardTitle className="text-lg">Add the details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  So authorities can verify and respond.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="municipality">Municipality</Label>
                <Controller
                  name="municipality"
                  control={control}
                  defaultValue={undefined}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="municipality" className="w-full">
                        <SelectValue placeholder="Select municipality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Accra">Accra</SelectItem>
                        <SelectItem value="Kumasi">Kumasi</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.municipality && (
                  <p className="text-sm text-destructive">
                    {errors.municipality.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  placeholder="What are you seeing? How deep is the water, is a road blocked, etc."
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("photo")}
                  className="justify-start"
                >
                  <MapPin className="size-4" />
                  {location ? "Location captured" : "Retry location capture"}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="mt-1 bg-gradient-to-r from-brand-from to-brand-to text-primary-foreground shadow-sm hover:opacity-90"
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? "Submitting…" : "Submit report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
