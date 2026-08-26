export const MIN_RESOLUTION_NOTES_LENGTH = 10;
export const MAX_RESOLUTION_NOTES_LENGTH = 2000;

export function validateResolutionNotes(
  value: string
): { ok: true; notes: string } | { ok: false; error: string } {
  const notes = value.trim();

  if (notes.length < MIN_RESOLUTION_NOTES_LENGTH) {
    return {
      ok: false,
      error: `Add resolution notes of at least ${MIN_RESOLUTION_NOTES_LENGTH} characters. Citizens will see this.`,
    };
  }

  if (notes.length > MAX_RESOLUTION_NOTES_LENGTH) {
    return {
      ok: false,
      error: `Resolution notes must be ${MAX_RESOLUTION_NOTES_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, notes };
}
