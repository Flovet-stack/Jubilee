import "server-only";

import { getCurrentUserId } from "@/features/auth/queries";
import { createClient } from "@/lib/supabase/server";

import {
  errorFromDatabase,
  fail,
  isUuid,
  migrateContent,
  ok,
  type CvTarget,
  type Result,
} from "./logic";
import type { CvContent, CvLanguage, CvMarket } from "./schemas";

/**
 * Reads for CVs (decision 0002: the only Supabase reads of these tables).
 * RLS limits every query to the signed-in user's rows (decision 0016); the
 * session check here only turns "signed out" into a clear error.
 */

export type CvSummary = {
  id: string;
  title: string;
  language: CvLanguage;
  market: CvMarket;
  updatedAt: string;
};

export type CvDocument = CvSummary & {
  template: string | null;
  content: CvContent;
  /** Versions only: the master CV it came from (null once deleted). */
  cvId: string | null;
  jobId: string | null;
};

export type RevisionSummary = {
  id: string;
  source: "user" | "ai" | "import" | "restore";
  note: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  title: string;
  language: string;
  market: string;
  template: string | null;
  content: unknown;
  schema_version: number;
  updated_at: string;
  cv_id?: string | null;
  job_id?: string | null;
};

/** The database checks language, market and source; these narrow the types. */
const asLanguage = (value: string) => value as CvLanguage;
const asMarket = (value: string) => value as CvMarket;
const asSource = (value: string) => value as RevisionSummary["source"];

export async function signedInClient() {
  const userId = await getCurrentUserId();
  return userId ? createClient() : null;
}

function toDocument(row: Row): Result<CvDocument> {
  const content = migrateContent(row.content, row.schema_version);
  if (!content.ok) return content;
  return ok({
    id: row.id,
    title: row.title,
    language: asLanguage(row.language),
    market: asMarket(row.market),
    template: row.template,
    updatedAt: row.updated_at,
    content: content.value,
    cvId: row.cv_id ?? null,
    jobId: row.job_id ?? null,
  });
}

/** The user's master CVs, most recently edited first. Empty when none. */
export async function listCvs(): Promise<Result<CvSummary[]>> {
  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase
    .from("cvs")
    .select("id, title, language, market, updated_at")
    .order("updated_at", { ascending: false });
  if (error) return fail(errorFromDatabase(error));

  return ok(
    data.map((row) => ({
      id: row.id,
      title: row.title,
      language: asLanguage(row.language),
      market: asMarket(row.market),
      updatedAt: row.updated_at,
    })),
  );
}

/** One CV or version with its content, migrated to the current schema. */
export async function getCvDocument(
  target: CvTarget,
): Promise<Result<CvDocument>> {
  if (!isUuid(target.id)) return fail({ code: "not_found" });
  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } =
    target.kind === "cv"
      ? await supabase
          .from("cvs")
          .select(
            "id, title, language, market, template, content, schema_version, updated_at",
          )
          .eq("id", target.id)
          .maybeSingle()
      : await supabase
          .from("cv_versions")
          .select(
            "id, title, language, market, template, content, schema_version, updated_at, cv_id, job_id",
          )
          .eq("id", target.id)
          .maybeSingle();
  if (error) return fail(errorFromDatabase(error));
  if (!data) return fail({ code: "not_found" });

  return toDocument(data);
}

/** A revision's stored content and schema version, for restoring it. */
export async function getRevisionContent(
  revisionId: string,
): Promise<Result<{ content: unknown; schemaVersion: number }>> {
  if (!isUuid(revisionId)) return fail({ code: "not_found" });
  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase
    .from("cv_revisions")
    .select("content, schema_version")
    .eq("id", revisionId)
    .maybeSingle();
  if (error) return fail(errorFromDatabase(error));
  if (!data) return fail({ code: "not_found" });
  return ok({ content: data.content, schemaVersion: data.schema_version });
}

/** The history of a CV or version, newest first. */
export async function listRevisions(
  target: CvTarget,
): Promise<Result<RevisionSummary[]>> {
  if (!isUuid(target.id)) return fail({ code: "not_found" });
  const supabase = await signedInClient();
  if (!supabase) return fail({ code: "unauthenticated" });

  const { data, error } = await supabase
    .from("cv_revisions")
    .select("id, source, note, created_at")
    .eq(target.kind === "cv" ? "cv_id" : "cv_version_id", target.id)
    .order("created_at", { ascending: false });
  if (error) return fail(errorFromDatabase(error));

  return ok(
    data.map((row) => ({
      id: row.id,
      source: asSource(row.source),
      note: row.note,
      createdAt: row.created_at,
    })),
  );
}
