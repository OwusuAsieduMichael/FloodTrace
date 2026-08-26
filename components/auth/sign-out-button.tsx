"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { signOutToLanding } from "@/lib/auth/sign-out-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true);
        await signOutToLanding();
      }}
    >
      <LogOut className="size-4" aria-hidden />
      {isSigningOut ? "Signing out…" : "Sign out"}
    </Button>
  );
}
