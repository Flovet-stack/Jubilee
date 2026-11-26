import "server-only";

import { createClient } from "@/lib/supabase/server";

import { startOfUtcDay } from "./limits";
import type { UsageRow } from "./run-task-core";

/** Today's successful AI calls for the signed-in user (RLS: own rows). */
export async function countOkToday(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("ok", true)
    .gte("created_at", startOfUtcDay(new Date()).toISOString());
  if (error) throw error;
  return count ?? 0;
}

/**
 * One row per call, through log_ai_usage, which writes it for the signed-in
 * user. Two calls at the limit at once may both pass: an off-by-one we accept
 * rather than lock the table (spec 25).
 */
export async function logUsage(usage: UsageRow): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("log_ai_usage", {
    p_task: usage.task,
    p_provider: usage.provider,
    p_model: usage.model,
    p_input_tokens: usage.inputTokens,
    p_output_tokens: usage.outputTokens,
    p_cost_usd: usage.costUsd,
    p_ok: usage.ok,
    ...(usage.errorReason ? { p_error_reason: usage.errorReason } : {}),
  });
  if (error) throw error;
}
