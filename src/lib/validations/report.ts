import { z } from "zod";

export const reportSchema = z.object({
  municipality: z.enum(["Accra", "Kumasi"], {
    message: "Select a municipality",
  }),
  description: z
    .string()
    .min(10, "Describe what you're seeing in at least 10 characters")
    .max(1000, "Keep the description under 1000 characters"),
});

export type ReportInput = z.infer<typeof reportSchema>;
