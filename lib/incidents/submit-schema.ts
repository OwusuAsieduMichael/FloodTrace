import { z } from "zod";

/** Shared report payload rules. GPS, timestamp, and type must be real captured values. */
export const submitReportSchema = z.object({
  incident_type: z.enum(["flood", "blocked_drain"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z
    .string()
    .max(2000)
    .optional()
    .transform((value) => value?.trim() || null),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracy: z.coerce.number().positive().optional(),
  captured_at: z.string().datetime(),
  location_name: z
    .string()
    .max(180)
    .optional()
    .transform((value) => value?.trim() || null),
});

export type SubmitReportInput = z.infer<typeof submitReportSchema>;
