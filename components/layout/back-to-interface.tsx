"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { previousInterfacePath } from "@/lib/navigation/previous-interface";

interface BackToInterfaceProps {
  fallbackHref: string;
  label?: string;
}

export function BackToInterface({
  fallbackHref,
  label = "Back",
}: BackToInterfaceProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleBack() {
    const previous =
      typeof window === "undefined"
        ? null
        : previousInterfacePath(document.referrer, window.location.origin, pathname);

    if (previous) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="-ml-2 h-11 w-fit px-3 text-muted-foreground touch-manipulation sm:h-8"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
