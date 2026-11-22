import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/env";
import type { Database } from "@/types/database.types";

/** For Client Components. Uses the publishable key only (decision 0004). */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
