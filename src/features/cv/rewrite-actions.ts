"use server";

import { z } from "zod";

import { getCurrentUserId } from "@/features/auth/queries";
import { type AiFailure, runTask } from "@/lib/ai";

import { addRevision } from "./actions";
import type { Result } from "./logic";
import { FIELD_MAX, REWRITE_FINDINGS } from "./rewrite";

/**
 * "Suggest a rewrite" (spec 29): asks for one proposal, and records an
 * accepted one. Proposals aren't stored; the editor holds them until Accept
 * or Reject (0049). Contact details are removed inside runTask (0036).
 */

const requestSchema = z.object({
  kind: z.enum(["summary", "bullet"]),
  text: z.string().trim().min(1).max(2000),
  language: z.enum(["en", "fr"]),
  title: z.string().max(200).optional(),
  employer: z.string().max(200).optional(),
  finding: z.enum(REWRITE_FINDINGS).optional(),
  maxLength: z.number().int().min(20).max(2000),
});

export type RewriteRequest = z.input<typeof requestSchema>;

/** Signed out has its own fix ("sign in again"), unlike the AI failures. */
export type RewriteFailure = AiFailure | "signedOut";

export type RewriteResponse =
  | { ok: true; text: string; reason: string }
  | { ok: false; reason: RewriteFailure };

export async function suggestRewriteAction(
  request: RewriteRequest,
): Promise<RewriteResponse> {
  const parsed = requestSchema.safeParse(request);
  if (!parsed.success) return { ok: false, reason: "failed" };
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "signedOut" };
  const result = await runTask("cv.rewrite", parsed.data, { userId });
  if (!result.ok) return result;
  const text = plainText(result.data.text);
  // Longer than the field can hold: it could never be saved.
  if (text.length > FIELD_MAX[parsed.data.kind])
    return { ok: false, reason: "failed" };
  return { ok: true, text, reason: plainText(result.data.reason) };
}

/**
 * Models write typographic hyphens and spaces (U+2010, U+2011, U+202F) that
 * she can't type and the CV font may not draw: keep the plain ones. French
 * spacing before ":" stays a space.
 */
function plainText(value: string): string {
  return value.replace(/[\u2010\u2011]/g, "-").replace(/[\u00a0\u202f]/g, " ");
}

/**
 * After Accept (or Edit) and the autosave: one revision with source "ai"
 * (decision 0016), so the change is in the history and can be restored.
 */
export async function recordRewriteAction(
  cvId: string,
  note: string,
): Promise<Result<{ id: string }>> {
  return addRevision({ kind: "cv", id: cvId }, { source: "ai", note });
}
