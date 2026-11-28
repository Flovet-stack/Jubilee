"use server";

import { redirect } from "next/navigation";

import { toLocale } from "@/features/auth/logic";
import { getCurrentUserId } from "@/features/auth/queries";
import { addRevision, createCv } from "@/features/cv/actions";
import { languageOf } from "@/i18n/locales";
import { loadMessages } from "@/i18n/messages";
import { type AiFailure, runTask } from "@/lib/ai";

import { readPaste, readPdf, type InputFailure } from "./input";
import { findContact, isEmptyImport, toCvContent } from "./map";

/**
 * Import from LinkedIn and Upload a CV (spec 31, 0050, 0052). Reads the
 * file or text in memory, asks `cv.import`, makes a new CV with the
 * sections marked "Imported: check it", records an `import` revision and
 * opens the editor. Contact details are removed inside runTask (0036) and
 * read back here from the original text.
 */

export type ImportFailure = AiFailure | InputFailure | "signedOut";
export type ImportState = { error: ImportFailure | null };

export async function importCvAction(
  _state: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const locale = toLocale(formData.get("locale"));
  const source = formData.get("source") === "upload" ? "upload" : "linkedin";

  const userId = await getCurrentUserId();
  if (!userId) return { error: "signedOut" };

  // Only the open tab counts; Upload a CV is PDF only.
  const mode =
    source === "linkedin" && formData.get("mode") === "paste" ? "paste" : "pdf";
  const file = formData.get("file");
  const paste = formData.get("text");
  const input =
    mode === "pdf"
      ? file instanceof File && file.size > 0
        ? await readPdf(file)
        : ({ ok: false, reason: "not_pdf" } as const)
      : readPaste(typeof paste === "string" ? paste : "");
  if (!input.ok) return { error: input.reason };

  const language = languageOf(locale);
  const result = await runTask(
    "cv.import",
    { text: input.text, source, locale: language },
    { userId },
  );
  if (!result.ok) return { error: result.reason };

  const { content, language: found } = toCvContent(
    result.data,
    findContact(input.text),
  );
  if (isEmptyImport(content)) return { error: "failed" };

  const cvLanguage = found ?? language;
  // Server Actions can't read the route's locale (next/root-params), so the
  // two strings come straight from the message files.
  const messages = await loadMessages(locale);
  const created = await createCv(
    {
      title: messages.cv.create.titleWord,
      language: cvLanguage,
      market: cvLanguage === "fr" ? "FR" : "US",
    },
    content,
  );
  if (!created.ok) {
    return {
      error: created.error.code === "unauthenticated" ? "signedOut" : "failed",
    };
  }

  // The CV exists either way; a missing history row isn't worth losing it.
  await addRevision(
    { kind: "cv", id: created.value.id },
    { source: "import", note: messages.cv.import.revision[source] },
  );
  redirect(`/${locale}/cvs/${created.value.id}`);
}
