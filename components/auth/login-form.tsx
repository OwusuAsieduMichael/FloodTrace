"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { ResendEmailControl } from "@/components/auth/resend-email-control";
import { useEmailResendCooldown } from "@/components/auth/use-email-resend-cooldown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCooldown } from "@/lib/auth/email-cooldown";
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth";
import { safePostLoginPath } from "@/lib/security/safe-path";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const confirmationCooldown = useEmailResendCooldown("signup", email);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const unconfirmed =
        error.code === "email_not_confirmed" ||
        /not confirmed/i.test(error.message);

      if (unconfirmed) {
        setNeedsEmailConfirmation(true);
        toast.error("Confirm your email before signing in.");
      } else {
        toast.error(error.message);
      }

      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, authority_status")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      toast.error("Signed in, but your profile could not be loaded.");
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back.");
    navigateAfterAuth(safePostLoginPath(redirectTo, profile));
  }

  async function handleResendConfirmation() {
    if (!confirmationCooldown.canResend) {
      toast.error(
        `Wait ${formatCooldown(confirmationCooldown.remaining)} before requesting another confirmation.`
      );
      return;
    }

    setIsResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setIsResending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    confirmationCooldown.markSent();
    toast.success("A new confirmation email is on the way.");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="inline-flex min-h-11 items-center text-xs text-primary hover:underline sm:min-h-0"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" className="h-11 w-full text-base sm:h-9 sm:text-sm" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {needsEmailConfirmation ? (
          <div className="mt-4">
            <ResendEmailControl
              remaining={confirmationCooldown.remaining}
              canResend={confirmationCooldown.canResend}
              isSending={isResending}
              onResend={handleResendConfirmation}
              label="Resend confirmation"
            />
          </div>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline sm:min-h-0">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
