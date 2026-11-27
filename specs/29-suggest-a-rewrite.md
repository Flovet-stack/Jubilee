# 29: Suggest a rewrite

Status: Ready · Written: 2026-11-27

## Goal

Let Aminata ask for a better wording of one summary or one bullet, see it beside her own, and keep it only if she accepts. This is the first AI she sees in the editor, and it builds the **proposal card** that import, tailoring and translation will reuse (0049).

## User lens

0049's lens: Aminata, 29, data analyst in Paris, on a laptop in the evening.

1. **Why she opens it:** the Review tab says a bullet is long or has no number, or a line just reads flat. "Make this sound better, but keep it mine."
2. **How she uses it:** she clicks "Suggest a rewrite" on the finding or next to the field, waits a few seconds, reads one before/after with a one-line reason, and accepts, edits or rejects it.
3. **What she wants next:** back to her CV, with the change in the preview and a way to undo it.
4. **What we leave out:** rewriting a whole entry, section or CV; rewriting without a click; inventing numbers; AI review notes; keeping proposals after she leaves the page.

## Decisions

Implements [0049](../docs/decisions/0049-ai-in-the-cv-editor.md) place 1 and its proposal card, and [0031](../docs/decisions/0031-cv-editor-two-panes-and-review.md) §4. Builds on:

- [0036](../docs/decisions/0036-ai-provider-and-integration.md): `runTask`, routing, daily caps, redaction, calm failures, evals.
- [0016](../docs/decisions/0016-cv-data-model-and-pdf-rendering.md): AI never writes `content` without an accepted proposal; accepting appends a `cv_revisions` row with `source = 'ai'`.
- [0042](../docs/decisions/0042-editor-top-bar-download-and-finding-severity.md): findings and their severity.
- [0029](../docs/decisions/0029-type-spacing-for-every-control.md), [0045](../docs/decisions/0045-larger-icons-in-icon-buttons-and-heavier-stroke.md): control spacing and icons.

## Acceptance criteria

1. **Where the button is.**
   - In an open form: next to the summary field, and next to each bullet that has text.
   - In the Review tab and on the entry's finding line: on the `longSummary`, `bulletsWithoutNumbers` and `longBullets` findings. For a bullet finding, it rewrites the first matching bullet, and the form opens on that entry.
   - Not on empty fields, and not on findings about something missing (`noSummary`, `noBullets`, `noHeadline`, `noDates`, `contactReach`): there's nothing of hers to reword.
   - Label "Suggest a rewrite" (copy in the message files, en and fr; never "AI").
2. **The task.** `cv.rewrite` replaces its placeholder in `src/lib/ai/tasks.ts`:
   - Input: the text, its kind (summary or bullet), the CV language, the entry's title and employer for context, and the finding code if any.
   - Output: the new text and a one-line reason, both in the CV's language.
   - The prompt rewords only. It keeps every fact, adds no number, tool, employer, title or date, and stays within the field's length limit. On `bulletsWithoutNumbers`, the reason may ask her to add a figure she knows; the text never contains one she didn't write.
3. **The proposal card** (a reusable component, built here, used by later specs):
   - It shows under the field it changes: her text struck through, the new text highlighted, the reason, and **Accept**, **Edit** and **Reject**.
   - **Edit** puts the proposed text into the field for her to change, and closes the card.
   - While it's waiting: the button shows its loading state, and the card's place holds a short "Writing a suggestion…" line. One request at a time per field; a second click does nothing.
   - Keyboard: focus moves to the card when it appears and back to the button when it closes. Screen readers hear the card's arrival (a polite live region).
4. **New details.** Code, not the model, compares the proposal with the whole CV. Any number, or any word that looks like a name or tool (capitalised mid-sentence, or with digits or symbols), that isn't in the CV is marked **"New detail: check it's true"**. While any is marked, Accept is disabled; Edit stays available. The check is a pure function with unit tests in English and French.
5. **Accepting.**
   - The field takes the new text, the CV autosaves, and one `cv_revisions` row is added with `source = 'ai'` and a note ("Rewrote a bullet in Analyst · Doctolib").
   - A toast offers **Undo**, which puts her text back (it's saved like any edit).
   - The preview and the Review tab update.
6. **Rejecting** closes the card and changes nothing. Proposals live only in the editor; leaving the page or closing the form discards them.
7. **Failures and limits.** `ai.errors.<reason>` messages (0036), shown in the card's place, with nothing lost. The daily cap counts each request. Contact details never reach the prompt (redaction already runs in `runTask`).
8. **Eval.** Fixtures for `cv.rewrite` in English and French (summary and bullets, including one with no number). `pnpm ai:eval` checks: schema valid, no new detail by the check in 4, length within the limit, language kept.

## Out of scope

- Rewriting entries, sections, the headline or the whole CV.
- Proposals stored in the database, or a history of proposals.
- Several alternatives or "Try again"; she can reject and click again.
- AI review findings, AI notes in the Guidance tab.
- Import, tailoring, translation (later specs reuse the card).

## Edge cases

- A bullet already at the length limit, or very short ("Excel").
- French text, and a CV whose language differs from the site's.
- A bullet edited while its suggestion is loading: the card is dropped on arrival, since her text changed.
- The entry or bullet is deleted, or the form closed, while loading.
- The model returns the same text: the card says "No better wording found" and offers nothing to accept.
- The cap is reached: the button stays, and clicking it shows the limit message.
- Hidden entries: the button works; hiding doesn't affect wording.
- 390 px: the card fits under the field without horizontal scroll; buttons at least 44 px tall on touch.

## Files

- `src/lib/ai/tasks.ts` (the `cv.rewrite` task), `src/lib/ai/fixtures/`, `scripts/ai-eval.*`.
- A new feature module for the rewrite: a server action that calls `runTask`, and the new-detail check with its tests, under `src/features/cv/`.
- A `ProposalCard` component (new, reusable) and the forms in `section-forms.tsx`; the finding lines in `cv-editor.tsx`.
- The message files (en, fr; en-GB only where it differs).

## Boundaries

- **Always:** proposals through the card; nothing generated without a click; `runTask` only (no provider imports); copy in the message files; type spacing for every control.
- **Ask first:** any new dependency; storing proposals; changing the daily caps or the routing.
- **Never:** write `content` from AI without Accept; add facts; send contact details; label anything "AI".

## Check

- `pnpm check`.
- Unit tests: the new-detail check (en, fr; numbers, tools, names, no false flags on her own words), the task's prompt and schemas.
- `pnpm ai:eval` for `cv.rewrite` on its fixtures.
- In the browser: rewrite a summary and a bullet, accept one and undo it, reject one, trigger a new-detail flag, and see a failure message (with the key unset or the cap reached). Screenshots at 1440 and 390 px, light and dark.
- Reviewer: 90 or more.
