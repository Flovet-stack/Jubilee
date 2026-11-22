"use server";

import { redirect } from "next/navigation";

import { toLocale } from "@/features/auth/logic";

import {
  addRevision,
  createCv,
  renameCvDocument,
  saveContent,
} from "./actions";
import type { CvError, Result } from "./logic";

/**
 * Server actions for the CV builder (spec 14). Thin wrappers over the plain
 * functions in `actions.ts` (decision 0002), which validate everything and
 * rely on RLS for ownership. Only master CVs are edited here.
 */

export type CreateCvState = { error: CvError | null };

/** "Create a CV" form: makes the CV and opens the editor on Contact. */
export async function createCvAction(
  _state: CreateCvState,
  formData: FormData,
): Promise<CreateCvState> {
  const locale = toLocale(formData.get("locale"));
  const result = await createCv({
    title: String(formData.get("title") ?? ""),
    language: String(formData.get("language") ?? ""),
    market: String(formData.get("market") ?? ""),
  });
  if (!result.ok) return { error: result.error };
  redirect(`/${locale}/cvs/${result.value.id}?start=1`);
}

/** Autosave (0024 §4). */
export async function saveCvAction(
  id: string,
  content: unknown,
  expectedUpdatedAt: string,
): Promise<Result<{ updatedAt: string }>> {
  return saveContent({ kind: "cv", id }, content, expectedUpdatedAt);
}

/** First save of a visit: snapshot the CV as it was when opened (0016, 0024). */
export async function startEditSessionAction(
  id: string,
): Promise<Result<{ id: string }>> {
  return addRevision({ kind: "cv", id }, { source: "user" });
}

export async function renameCvAction(
  id: string,
  title: string,
): Promise<Result<{ title: string; updatedAt: string }>> {
  return renameCvDocument({ kind: "cv", id }, title);
}
