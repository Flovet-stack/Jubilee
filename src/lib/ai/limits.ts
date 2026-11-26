import "server-only";

/** Daily AI tasks per user (approved by Flovet, 2026-11-26). */
export const DAILY_LIMIT = { free: 10, pass: 100 } as const;

/**
 * Every user is on the free plan until the job-search pass exists (#35);
 * that spec changes only this function.
 */
export async function getAiDailyLimit(userId: string): Promise<number> {
  void userId;
  return DAILY_LIMIT.free;
}

/** Days are counted in UTC; the copy says "tomorrow", never a clock time. */
export function startOfUtcDay(now: Date): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
