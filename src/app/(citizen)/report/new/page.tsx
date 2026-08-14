"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  const [photo, setPhoto] = useState<File | null>(null);

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
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportInput>({ resolver: zodResolver(reportSchema) });

  async function onSubmit(data: ReportInput) {
    if (!user) return;
    if (!photo) {
      toast.error("Add a photo of the flooding or drainage issue.");
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

  return (
    <div className="flex flex-1 flex-col p-4">
      <Card>
        <CardHeader>
          <CardTitle>Report flooding or drainage issue</CardTitle>
          <CardDescription>
            Add a photo and your location so authorities can verify and
            respond.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="photo">Photo</Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="municipality">Municipality</Label>
              <select
                id="municipality"
                {...register("municipality")}
                defaultValue=""
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
              >
                <option value="" disabled>
                  Select municipality
                </option>
                <option value="Accra">Accra</option>
                <option value="Kumasi">Kumasi</option>
              </select>
              {errors.municipality && (
                <p className="text-sm text-destructive">
                  {errors.municipality.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
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
                onClick={capture}
                disabled={locating}
              >
                <MapPin className="size-4" />
                {location
                  ? "Location captured"
                  : locating
                    ? "Locating…"
                    : "Capture my location"}
              </Button>
              {locationError && (
                <p className="text-sm text-destructive">{locationError}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Submitting…" : "Submit report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
