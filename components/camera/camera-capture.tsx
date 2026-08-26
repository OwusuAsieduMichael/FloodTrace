"use client";

import { Camera, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export interface CapturedPhoto {
  blob: Blob;
  file: File;
  previewUrl: string;
  capturedAt: string;
}

interface CameraCaptureProps {
  photo: CapturedPhoto | null;
  onCapture: (photo: CapturedPhoto) => void;
  onClear: () => void;
}

export function CameraCapture({ photo, onCapture, onClear }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    stopStream();

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is not supported in this browser.");
      setIsStarting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError(
        "Camera permission was denied or no camera is available. Allow camera access to continue."
      );
    } finally {
      setIsStarting(false);
    }
  }, [stopStream]);

  useEffect(() => {
    if (!photo) {
      void startCamera();
    }

    return () => {
      stopStream();
    };
  }, [photo, startCamera, stopStream]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setError("Camera is still starting. Wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Unable to capture photo. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Unable to capture photo. Please try again.");
          return;
        }

        const capturedAt = new Date().toISOString();
        const file = new File([blob], `floodtrace-evidence-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(blob);

        stopStream();
        onCapture({ blob, file, previewUrl, capturedAt });
      },
      "image/jpeg",
      0.88
    );
  }

  function handleRetake() {
    onClear();
    void startCamera();
  }

  if (photo) {
    return (
      <div className="space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.previewUrl}
          alt="Captured incident evidence"
          className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleRetake}>
            <RotateCcw className="size-4" />
            Retake photo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Captured {new Date(photo.capturedAt).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Camera unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted",
          isStarting && "animate-pulse"
        )}
      >
        {!error ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="size-full object-cover"
            aria-label="Live camera preview"
          />
        ) : (
          <div className="flex size-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Enable camera access to capture live evidence.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {error ? (
          <Button type="button" className="flex-1" onClick={startCamera}>
            Retry camera
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            disabled={isStarting}
            onClick={handleCapture}
          >
            <Camera className="size-4" />
            {isStarting ? "Starting camera…" : "Capture photo"}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Live camera capture is required. Gallery uploads are not accepted for
        incident evidence.
      </p>
    </div>
  );
}
