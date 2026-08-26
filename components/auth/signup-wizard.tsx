"use client";

import Link from "next/link";
import { Building2, CheckCircle2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { ResendEmailControl } from "@/components/auth/resend-email-control";
import { useEmailResendCooldown } from "@/components/auth/use-email-resend-cooldown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth";
import { getPostAuthRedirect } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

type SignupStep = "account" | "role" | "profile" | "done";

const STEPS: SignupStep[] = ["account", "role", "profile", "done"];

export function SignupWizard() {
  const [step, setStep] = useState<SignupStep>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const confirmationCooldown = useEmailResendCooldown("signup", email);

  const stepIndex = STEPS.indexOf(step);

  function goToAccountStep() {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setStep("role");
  }

  function goToProfileStep() {
    if (!role) {
      toast.error("Choose an account type to continue.");
      return;
    }

    setStep("profile");
  }

  async function handleSignup() {
    if (!role) {
      toast.error("Choose an account type to continue.");
      return;
    }

    if (role !== "citizen" && role !== "authority") {
      toast.error("Choose a citizen or authority account.");
      setIsLoading(false);
      return;
    }

    if (!fullName.trim()) {
      toast.error("Enter your full name.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, authority_status")
        .eq("id", data.user!.id)
        .single();

      if (profileError || !profile) {
        toast.error("Account created, but your profile could not be loaded.");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully.");
      navigateAfterAuth(getPostAuthRedirect(profile));
      return;
    }

    setNeedsEmailConfirmation(true);
    confirmationCooldown.markSent();
    setStep("done");
    setIsLoading(false);
  }

  async function handleResendConfirmation() {
    if (!confirmationCooldown.canResend) {
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
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        {STEPS.slice(0, 3).map((item, index) => (
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
            {index < 2 ? (
              <span
                className={cn(
                  "h-px w-8",
                  index < stepIndex ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === "account" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
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
                <Label htmlFor="signup-password">Password</Label>
                <PasswordInput
                  id="signup-password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm password</Label>
                <PasswordInput
                  id="signup-confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              <Button type="button" className="h-11 w-full text-base sm:h-9 sm:text-sm" onClick={goToAccountStep}>
                Continue
              </Button>
            </div>
          ) : null}

          {step === "role" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose how you will use FloodTrace. Authority accounts can
                verify incidents, assign teams, and record resolutions right
                after signup.
              </p>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setRole("citizen")}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    role === "citizen"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UserRound className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">Citizen</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Report floods and blocked drains with camera-verified
                        evidence.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("authority")}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    role === "authority"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">Authority</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Verify incidents, assign teams, and record resolutions
                        for your municipality.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 sm:h-8"
                  onClick={() => setStep("account")}
                >
                  Back
                </Button>
                <Button type="button" className="flex-1 h-11 sm:h-8" onClick={goToProfileStep}>
                  Continue
                </Button>
              </div>
            </div>
          ) : null}

          {step === "profile" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input
                  id="full-name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Ama Mensah"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 sm:h-8"
                  onClick={() => setStep("role")}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-11 sm:h-8"
                  disabled={isLoading}
                  onClick={handleSignup}
                >
                  {isLoading ? "Creating account…" : "Create account"}
                </Button>
              </div>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="space-y-4 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </span>
              <div className="space-y-2">
                <p className="font-medium">Account created</p>
                {needsEmailConfirmation ? (
                  <p className="text-sm text-muted-foreground">
                    Check your email at <strong>{email}</strong> to confirm your
                    account, then sign in.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your account is ready. You can sign in now.
                  </p>
                )}
              </div>
              <Button render={<Link href="/auth/login" />} className="h-11 w-full text-base sm:h-9 sm:text-sm">
                Go to sign in
              </Button>
              {needsEmailConfirmation ? (
                <ResendEmailControl
                  remaining={confirmationCooldown.remaining}
                  canResend={confirmationCooldown.canResend}
                  isSending={isResending}
                  onResend={handleResendConfirmation}
                  label="Resend confirmation"
                />
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {step !== "done" ? (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline sm:min-h-0">
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
