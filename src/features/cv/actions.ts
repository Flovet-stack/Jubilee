import "server-only";

import type { Json } from "@/types/database.types";

import {
  emptyCvContent,
  errorFromDatabase,
  fail,
  isUuid,
  migrateContent,
  ok,
  validateContent,
  type CvTarget,
  type Result,
} from "./logic";
import { getCvDocument, getRevisionContent, signedInClient } from "./queries";
import {
  CV_SCHEMA_VERSION,
  newCvSchema,
  revisionNoteSchema,
  type CvContent,
} from "./schemas";

/**
 * Writes for CVs (decision 0002: the only Supabase writes to these tables).
 * Plain server functions, no screens yet (spec 09): the builder (#14) wraps
 * them in server actions. Content is validated with Zod before every write
 * and never written in part. RLS and the database's ownership keys make
 * another user's rows "not found".
 */

const TABLE = { cv: "cvs", version: "cv_versions" } as const;

/** The revision column that points at the target. */
const parentOf = (target: CvTarget) =>
  target.kind === "cv"
    ? { cv_id: target.id, cv_version_id: null }
    : { cv_id: null, cv_version_id: target.id };

/** Zod output is plain JSON data; this only changes the static type. */
const asJson = (content: CvContent) => content as Json;

function invalidInput(issues: { message: string }[]) {
  return fail({ code: "invalid_input", issues: issues.map((i) => i.message) });
}

/** A new master CV with empty content. Returns its id. */
export async function createCv(input: {
  title: string;
  language: string;
  market: string;
}): Promise<Result<{ id: string }>> {
  const parsed = newCvSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);

  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase
    .from("cvs")
    .insert({
      ...parsed.data,
      content: asJson(emptyCvContent()),
      schema_version: CV_SCHEMA_VERSION,
    })
    .select("id")
    .single();
  if (error) return fail(errorFromDatabase(error));
  return ok({ id: data.id });
}

/** Replaces the content of a CV or version after validating all of it. */
export async function saveContent(
  target: CvTarget,
  content: unknown,
): Promise<Result<{ updatedAt: string }>> {
  if (!isUuid(target.id)) return fail({ code: "not_found" });
  const valid = validateContent(content);
  if (!valid.ok) return valid;

  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase
    .from(TABLE[target.kind])
    .update({
      content: asJson(valid.value),
      schema_version: CV_SCHEMA_VERSION,
    })
    .eq("id", target.id)
    .select("updated_at")
    .maybeSingle();
  if (error) return fail(errorFromDatabase(error));
  if (!data) return fail({ code: "not_found" });
  return ok({ updatedAt: data.updated_at });
}

/** A version of a master CV, starting from a copy of its content. */
export async function createVersion(
  cvId: string,
  input: { title: string },
): Promise<Result<{ id: string }>> {
  const source = await getCvDocument({ kind: "cv", id: cvId });
  if (!source.ok) return source;

  const title = newCvSchema.shape.title.safeParse(input.title);
  if (!title.success) return invalidInput(title.error.issues);

  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { language, market, template, content } = source.value;
  const { data, error } = await supabase
    .from("cv_versions")
    .insert({
      cv_id: cvId,
      title: title.data,
      language,
      market,
      template,
      content: asJson(content),
      schema_version: CV_SCHEMA_VERSION,
    })
    .select("id")
    .single();
  if (error) return fail(errorFromDatabase(error));
  return ok({ id: data.id });
}

/**
 * Saves the current content of a CV or version as a revision. The editor
 * calls it at most once per editing session; AI and import changes call it
 * after the user accepts them (decision 0016).
 */
export async function addRevision(
  target: CvTarget,
  input: { source: "user" | "ai" | "import"; note?: string },
): Promise<Result<{ id: string }>> {
  const note = revisionNoteSchema.safeParse(input.note ?? "");
  if (!note.success) return invalidInput(note.error.issues);

  const current = await getCvDocument(target);
  if (!current.ok) return current;

  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase
    .from("cv_revisions")
    .insert({
      ...parentOf(target),
      content: asJson(current.value.content),
      schema_version: CV_SCHEMA_VERSION,
      source: input.source,
      note: note.data || null,
    })
    .select("id")
    .single();
  if (error) return fail(errorFromDatabase(error));
  return ok({ id: data.id });
}

/**
 * Puts a revision's content back and appends a 'restore' revision, in one
 * transaction (`restore_cv_revision`). Older content is migrated first.
 */
export async function restoreRevision(
  revisionId: string,
): Promise<Result<{ revisionId: string }>> {
  const revision = await getRevisionContent(revisionId);
  if (!revision.ok) return revision;

  const content = migrateContent(
    revision.value.content,
    revision.value.schemaVersion,
  );
  if (!content.ok) return content;

  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase.rpc("restore_cv_revision", {
    revision_id: revisionId,
    restored_content: asJson(content.value),
    restored_schema_version: CV_SCHEMA_VERSION,
  });
  if (error) return fail(errorFromDatabase(error));
  return ok({ revisionId: data });
}

/** Deletes a CV (its versions stay) or a version, with their revisions. */
export async function deleteCvDocument(
  target: CvTarget,
): Promise<Result<null>> {
  if (!isUuid(target.id)) return fail({ code: "not_found" });
  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase
    .from(TABLE[target.kind])
    .delete()
    .eq("id", target.id)
    .select("id");
  if (error) return fail(errorFromDatabase(error));
  if (data.length === 0) return fail({ code: "not_found" });
  return ok(null);
}
