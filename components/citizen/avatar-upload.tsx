"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateAvatar } from "@/lib/auth/update-avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export function AvatarUpload({ fullName, email, avatarUrl }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  const initials = (fullName ?? email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await updateAvatar(formData);

    setIsUploading(false);

    if (!result.success) {
      setPreviewUrl(avatarUrl);
      toast.error(result.error);
      return;
    }

    setPreviewUrl(result.avatarUrl);
    toast.success("Avatar updated.");
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-lg font-semibold text-primary",
          previewUrl && "bg-muted"
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Profile avatar"
            className="size-full object-cover"
          />
        ) : (
          initials
        )}
        {isUploading ? (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-5 animate-spin text-primary" />
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="size-4" />
          Change photo
        </Button>
        <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP · max 2 MB</p>
      </div>
    </div>
  );
}
