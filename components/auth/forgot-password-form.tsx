"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ResendEmailControl } from "@/components/auth/resend-email-control";
import { useEmailResendCooldown } from "@/components/auth/use-email-resend-cooldown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCooldown } from "@/lib/auth/email-cooldown";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const cooldown = useEmailResendCooldown("recovery", email);

  async function sendResetEmail() {
    if (!cooldown.canResend) {
      toast.error(
        `Wait ${formatCooldown(cooldown.remaining)} before requesting another reset email.`
      );
      return false;
    }

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    cooldown.markSent();
    toast.success("Password reset email sent.");
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const ok = await sendResetEmail();
    setIsLoading(false);

    if (ok) {
      setSent(true);
    }
  }

  async function handleResend() {
    setIsLoading(true);
    await sendResetEmail();
    setIsLoading(false);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset link shortly.
          </p>
          <ResendEmailControl
            remaining={cooldown.remaining}
            canResend={cooldown.canResend}
            isSending={isLoading}
            onResend={handleResend}
            label="Resend reset email"
            waitLabel="You can request another reset email in"
          />
          <Button render={<Link href="/auth/login" />} variant="outline" className="w-full">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || cooldown.remaining > 0}
          >
            {isLoading
              ? "Sending…"
              : cooldown.remaining > 0
                ? `Try again in ${formatCooldown(cooldown.remaining)}`
                : "Send reset link"}
          </Button>
          {cooldown.remaining > 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              You can request another confirmation in{" "}
              {formatCooldown(cooldown.remaining)}.
            </p>
          ) : null}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
