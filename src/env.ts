import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables (decision 0004). Imported by next.config.ts,
 * so a missing or malformed value fails the build, not the first request.
 * Read env through this module, never through process.env.
 */
export const env = createEnv({
  // `next typegen` loads next.config.ts, but type generation never reads env.
  skipValidation: process.env.npm_lifecycle_event === "typecheck",
  server: {
    // Optional: without it, AI tasks return "unavailable" (0036, spec 25).
    // Read only in src/lib/ai/.
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().transform((url) => url.replace(/\/+$/, "")),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    // Optional: DNS verification needs nothing here.
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().min(1).optional(),
    // Optional: lets ?grid=1 load the grid-auditor overlay in production (0034).
    NEXT_PUBLIC_GRID_AUDITOR: z.enum(["true", "false"]).optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    NEXT_PUBLIC_GRID_AUDITOR: process.env.NEXT_PUBLIC_GRID_AUDITOR,
  },
  emptyStringAsUndefined: true,
});
