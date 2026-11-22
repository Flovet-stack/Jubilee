import { CV_SCHEMA_VERSION, cvContentSchema, type CvContent } from "./schemas";

/** Pure helpers for CV data (spec 09, decision 0016). Unit-tested. */

export type CvError =
  | { code: "unauthenticated" }
  | { code: "not_found" }
  | { code: "invalid_input"; issues: string[] }
  | { code: "invalid_content"; issues: string[] }
  | { code: "too_large" }
  | { code: "database" };

export type Result<T> = { ok: true; value: T } | { ok: false; error: CvError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T = never>(error: CvError): Result<T> => ({
  ok: false,
  error,
});

/** A CV or a tailored version, the two things content belongs to. */
export type CvTarget =
  { kind: "cv"; id: string } | { kind: "version"; id: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ids reach the database only when they can be one; anything else is "not found". */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** Readable paths for Zod issues: "sections.0.entries.1.endDate: ...". */
function describeIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map(
    (issue) =>
      `${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`,
  );
}

/** Content a new CV starts with: empty basics, the three usual sections. */
export function emptyCvContent(
  newId: () => string = () => crypto.randomUUID(),
): CvContent {
  return {
    basics: {
      name: "",
      headline: "",
      email: "",
      phone: "",
      location: { city: "", region: "", countryCode: "" },
      summary: "",
      links: [],
    },
    sections: [
      { id: newId(), kind: "work", title: "", hidden: false, entries: [] },
      { id: newId(), kind: "education", title: "", hidden: false, entries: [] },
      { id: newId(), kind: "skills", title: "", hidden: false, entries: [] },
    ],
  };
}

/** Validates content before any write. Never returns partial content. */
export function validateContent(raw: unknown): Result<CvContent> {
  const parsed = cvContentSchema.safeParse(raw);
  return parsed.success
    ? ok(parsed.data)
    : fail({
        code: "invalid_content",
        issues: describeIssues(parsed.error.issues),
      });
}

/**
 * Brings stored content up to `CV_SCHEMA_VERSION`. Version 1 is the only
 * version, so this validates; version 2 adds its step here, and every read
 * and restore already goes through it.
 */
export function migrateContent(
  raw: unknown,
  version: number,
): Result<CvContent> {
  if (
    !Number.isInteger(version) ||
    version < 1 ||
    version > CV_SCHEMA_VERSION
  ) {
    return fail({
      code: "invalid_content",
      issues: [`Unknown schema version ${version}`],
    });
  }
  return validateContent(raw);
}

/** Postgres errors the data layer turns into something the UI can say. */
export function errorFromDatabase(error: {
  code?: string;
  message?: string;
}): CvError {
  // check_violation on a *_content_size constraint
  if (error.code === "23514" && error.message?.includes("content_size")) {
    return { code: "too_large" };
  }
  // no row returned by .single(), or a foreign key to someone else's row
  if (
    error.code === "PGRST116" ||
    error.code === "23503" ||
    error.code === "P0002"
  ) {
    return { code: "not_found" };
  }
  return { code: "database" };
}
