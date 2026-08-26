import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  OPENWEATHER_API_KEY: z.string().min(1).optional(),
  DUPLICATE_RADIUS_METERS: z.coerce.number().positive().default(150),
  DUPLICATE_TIME_WINDOW_MINUTES: z.coerce.number().positive().default(30),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

/** Validated public env vars (safe for browser bundles). */
export function getPublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    throw new Error(
      `Missing or invalid public environment variables: ${formatZodError(result.error)}`
    );
  }

  return result.data;
}

/** Validated server env vars (never import from client components). */
export function getServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
    DUPLICATE_RADIUS_METERS: process.env.DUPLICATE_RADIUS_METERS,
    DUPLICATE_TIME_WINDOW_MINUTES: process.env.DUPLICATE_TIME_WINDOW_MINUTES,
  });

  if (!result.success) {
    throw new Error(
      `Missing or invalid server environment variables: ${formatZodError(result.error)}`
    );
  }

  return result.data;
}

/** Supabase project URL and anon key for client construction. */
export function getSupabasePublicConfig() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  return {
    url: NEXT_PUBLIC_SUPABASE_URL,
    anonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}
