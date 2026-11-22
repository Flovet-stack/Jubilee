# 0015: Keep the font's default word spacing

- **Status:** Approved
- **Proposed:** 2026-11-21 by the product team (roles: UI)
- **Approved:** 2026-11-21 by Flovet (in chat)
- **Supersedes:** 0013, Decision §5 (word spacing) only
- **Specs:** specs/06-sign-in-refresh.md

## Context

0013 added `word-spacing: 0.06em` to body text and `0.03em` to headings. Flovet saw it on the dev server and asked to remove it.

## Decision

No `word-spacing` in the app. Plus Jakarta Sans keeps its default spacing (0007). The rest of 0013 stands.

## Consequences

If readability comes up again, the next step is a font change (0013's option 2), not a spacing tweak.
