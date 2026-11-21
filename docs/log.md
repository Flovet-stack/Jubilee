# Project log

One dated entry per task: what was built, the review score, and what was left.

## 2026-11-21: Decision 0007 approved

- Flovet approved 0007 in chat. 0005's status notes that its Iconography paragraph is superseded by 0007; 0005 and 0007 link spec 02. Index, brief and spec 02 status updated.

## 2026-11-21: Design system built (spec 02)

- Decision 0007 and spec 02. Tokens for light and dark in `globals.css` (three tiers, Tailwind 4 theme), Plus Jakarta Sans via `next/font`, a contrast test over every 0005 pair (52 checks).
- 34 animated icons vendored from icons-animated (Hugeicons, as AniKansou) with a shared accessibility hook; 31 components (most on Base UI) with every state; `/design-system` preview (development only); guide in `docs/design/design-system.md`.
- New dependencies, approved by Flovet in chat: motion 13.1.1, @base-ui/react 1.9.0, class-variance-authority, clsx, tailwind-merge.
- Reviewed 96/100 (first pass 83: reduced-motion leaks, raw values, small toast targets, all fixed). `/design-system` returns 404 in the production build.
- Left: the app shell (providers, navigation) wires `TooltipProvider` and `ToastProvider`.

## 2026-11-21: Design decisions approved

- Flovet approved 0005 (visual foundations, "quiet desk, bright moments") and 0006 (interaction, disclosure, explicitness and space). The design brief is now Approved.
- Left: the design-foundations spec (tokens, font, base primitives), then the app shell, CV templates and icon list decisions.

## 2026-11-21: Design direction revised, no-ai-slop skill added

- After Flovet's review of the sample screens: 0005 rewritten as "quiet desk, bright moments" (Ownr-style violet and confetti accents, Clemta-style grey wells with light borders, Plus Jakarta Sans); 0006 grouping rule now uses wells and cards; brief updated. All still Proposed.
- New `claude-setup/skills/no-ai-slop/SKILL.md`: AI-generated UI, copy and behaviour tells from 7 sources, with Jubilee's rule for each, and how the borrowed Ownr/Clemta patterns stay safe.
- Sample canvas restyled to the new direction.

## 2026-11-21: Design brief proposed

- `docs/design/design-brief.md` plus decisions 0005 (visual foundations) and 0006 (interaction, progressive disclosure, hierarchy of explicitness, space), all Proposed. Structure drawn from GOV.UK, Atlassian, Carbon, Primer, Material and NN/g; approach from the FlickVale and AniKansou briefs.
- No code changed. Left: Flovet to approve 0005 and 0006; then a Jubilee no-ai-slop skill and the design-foundations spec.

## 2026-11-21: Codebase initialised

- Next.js 16.4.6 scaffold with pnpm, Prettier (Tailwind plugin), ESLint + Prettier config, Vitest and one smoke test; `pnpm check` script.
- Project brief, decision log (0001–0004 Proposed), spec 01 (Blocked on those decisions), product docs, product-team and reviewer skills.
- Left: Flovet to approve 0001–0004; then build spec 01. Design, AI, job sources, payments and email decisions still to research.
