export const EMAIL_RESEND_COOLDOWN_SECONDS = 60;

export function emailResendStorageKey(
  purpose: "signup" | "recovery",
  email: string
) {
  return `floodtrace:email-resend:${purpose}:${email.trim().toLowerCase()}`;
}

export function remainingCooldownSeconds(
  sentAtMs: number,
  nowMs: number,
  windowSeconds = EMAIL_RESEND_COOLDOWN_SECONDS
) {
  if (!Number.isFinite(sentAtMs) || sentAtMs <= 0) {
    return 0;
  }

  const elapsed = Math.floor((nowMs - sentAtMs) / 1000);
  return Math.max(0, windowSeconds - elapsed);
}

export function formatCooldown(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
