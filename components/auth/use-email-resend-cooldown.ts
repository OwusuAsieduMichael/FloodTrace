"use client";

import { useCallback, useEffect, useState } from "react";

import {
  EMAIL_RESEND_COOLDOWN_SECONDS,
  emailResendStorageKey,
  remainingCooldownSeconds,
} from "@/lib/auth/email-cooldown";

export function useEmailResendCooldown(
  purpose: "signup" | "recovery",
  email: string
) {
  const storageKey = emailResendStorageKey(purpose, email);
  const [remaining, setRemaining] = useState(0);

  const readRemaining = useCallback(() => {
    if (typeof window === "undefined" || !email.trim()) {
      setRemaining(0);
      return;
    }

    const raw = window.sessionStorage.getItem(storageKey);
    const sentAt = raw ? Number(raw) : 0;
    setRemaining(remainingCooldownSeconds(sentAt, Date.now()));
  }, [email, storageKey]);

  useEffect(() => {
    readRemaining();
    const timer = window.setInterval(readRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [readRemaining]);

  const markSent = useCallback(() => {
    if (typeof window === "undefined" || !email.trim()) {
      return;
    }

    window.sessionStorage.setItem(storageKey, String(Date.now()));
    setRemaining(EMAIL_RESEND_COOLDOWN_SECONDS);
  }, [email, storageKey]);

  return {
    remaining,
    canResend: remaining === 0 && Boolean(email.trim()),
    markSent,
  };
}
