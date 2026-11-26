import { loadMessages } from "@/i18n/messages";

import type { CvLanguage, CvMarket } from "./schemas";
import type { CvLabels } from "./tree";

/**
 * The words printed on a CV or in its file name come from the CV's language,
 * not the UI's (0017), so they're read from that language's message file
 * directly (next-intl's request config always follows the page's locale).
 */
async function documentMessages(language: CvLanguage) {
  const messages = await loadMessages(language === "fr" ? "fr-fr" : "en-us");
  return messages.cv.document;
}

export async function cvLabels(language: CvLanguage): Promise<CvLabels> {
  const { headings, present } = await documentMessages(language);
  return { headings, present };
}

/** "Resume" or "CV" for the file name (0038), by language and market. */
export async function cvFileWord(
  language: CvLanguage,
  market: CvMarket,
): Promise<string> {
  return (await documentMessages(language)).fileWord[market];
}
