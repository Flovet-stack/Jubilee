---
name: no-ai-slop
description: The patterns that make a UI, its copy or its behaviour look AI-generated, and the rule Jubilee follows instead. Read before designing, building or reviewing any Jubilee screen, component, copy or feature; the reviewer skill grades against it.
---

# No AI slop (Jubilee)

"AI slop" is not a style. It is what appears **when nobody decided**: the defaults a model reaches for, which readers now recognise as "nobody looked at this". For a product that asks people to trust it with their CV and their name in front of employers, looking generated is a trust problem, not a taste problem.

**The test for every choice:** would this exact choice fit any other product? If yes, it is a default. Replace it with something that comes from Jubilee: its material (the CV as paper, the stages of an application, the day's queue), its users (job seekers under stress, on a mid-range phone, in two languages) and its promise (nothing is sent without your yes).

Severity, used by the reviewer: **P0** a layperson would notice · **P1** a designer would notice · **P2** polish.

## 1. Colour

| Tell                                                                                          | Sev. | Jubilee rule                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purple/indigo → blue gradients; gradient headline text; gradient buttons                      | P0   | **No gradients anywhere** except a scrim over a photo. Our violet (0005) is flat, always                                                                                                                              |
| Glow, neon edges, coloured glow shadows, orbs, bokeh blobs, faint grid backdrops              | P0   | Depth from surface steps and hairlines (0005). Shadows are neutral and only on floating layers                                                                                                                        |
| Indigo/violet CTA as the unthinking default                                                   | P1   | Violet is a decision (0005 research, Flovet's brief) and is earned by the rules around it: one violet button per screen, warm confetti accents, navy-violet ink. A screen that is _only_ white + violet buttons fails |
| Emerald or teal as the "safe" accent once purple is out                                       | P1   | Why 0005 dropped its first green. Green appears only as the success state, with an icon and words                                                                                                                     |
| Cream + terracotta; near-black + acid green; one-hue "tasteful" palettes; slate/sand/espresso | P1   | Our palette: cool grey desk, white cards, navy-violet ink, violet action, marigold and pink as small celebration accents                                                                                              |
| Primary and accent within ~20° of hue (two swatches, one colour)                              | P1   | Accents sit far from violet on the wheel (marigold, pink); stage colours differ in lightness too                                                                                                                      |
| Light grey secondary text that fails 4.5:1                                                    | P0   | Every text token in 0005 is computed; `ink-subtle` only for skippable detail                                                                                                                                          |
| Dark mode shipped because "modern"                                                            | P1   | Light is the default; dark follows the system and is designed, not inverted                                                                                                                                           |

## 2. Typography

| Tell                                                                                                                          | Sev. | Jubilee rule                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| Inter / Roboto / Arial / system stack everywhere; Geist left from the Next.js starter                                         | P0   | Plus Jakarta Sans (0005), chosen for its geometric warmth and French accents. Geist and Inter never ship |
| The "tasteful" free-font cluster as the only design gesture (Space Grotesk, Syne, Sora, Instrument Serif, Fraunces, Cal Sans) | P1   | A font is not a personality; the layout, copy and moments must carry it too                              |
| One accent word in a headline in colour or italics ("You have **a dream**")                                                   | P1   | Emphasis by size and weight only. Headlines are one colour                                               |
| Tiny uppercase letter-spaced eyebrow labels above every heading; pill "badges" above headings                                 | P1   | The heading says what the section is. No eyebrows. A pill only for real state                            |
| Monospace labels, `A · B · C` meta strings in mono                                                                            | P1   | Meta lines in the UI face; a middle dot only between short facts                                         |
| Flat scale: headings barely bigger than body; or 6 sizes on one screen                                                        | P1   | Scale in 0005; at most three sizes per screen besides meta                                               |
| Title Case On Every Label                                                                                                     | P2   | Sentence case everywhere, in English and French                                                          |
| A font named in CSS but never loaded                                                                                          | P1   | Fonts through `next/font` only; the reviewer checks the network tab                                      |
| Numbers spelled out ("three applications")                                                                                    | P2   | Digits                                                                                                   |

## 3. Layout and composition

| Tell                                                                                               | Sev. | Jubilee rule                                                                                                                                      |
| -------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Centred hero + three equal feature cards with an icon in a rounded square                          | P0   | The app opens on the user's work (Today, the CV), left-aligned. Cards only for real objects (a job, an application, a CV)                         |
| Stock page order: hero → logos → features → stats → testimonials → pricing → CTA → 4-column footer | P1   | Each page's order comes from the task on it. Marketing pages get their own spec and must pass this file too                                       |
| Bento grid as the default composition                                                              | P1   | A grid only when the content is a set of equal things                                                                                             |
| Every section in the same centred container; even padding everywhere so nothing stands out         | P1   | Space by relationship (0006 §3): tight inside, generous between groups; widths by content (640 px forms, 1200 px boards)                          |
| Borders around every block; boxes inside boxes; hairline on every card _plus_ a diffuse shadow     | P1   | One containment pattern (0006 §3): a grey well with a hairline holds white cards with a hairline. Never a third level. No shadow on resting cards |
| Coloured stripe on one edge of a card                                                              | P1   | Status is a labelled pill with an icon                                                                                                            |
| Overstuffed dashboards: a card per metric, tips, banners, "What's new", checklists                 | P0   | Progressive disclosure (0006 §2): first level shows what most people need now                                                                     |
| Fake window dots, decorative `01 / 02 / 03`, visual metaphors drawn as labelled shapes             | P1   | Numbers only for real order (step 2 of 3)                                                                                                         |
| Big number as the hero with a small label and "supporting stats"                                   | P1   | A number is big only when it is the decision (the match score)                                                                                    |

## 4. Components

| Tell                                                                                                 | Sev. | Jubilee rule                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| Untouched shadcn/Tailwind defaults (stock radius, `rounded-2xl shadow-lg`, unstyled Card and Button) | P0   | No UI library look; primitives built on native elements, styled only through 0005 tokens                 |
| The same radius and soft shadow on everything                                                        | P1   | Radius by role (0005): 8 controls, 12 cards and wells, 16 sheets, 2 the CV paper, full pills             |
| Glass (`backdrop-blur`) on static cards                                                              | P1   | No blur. Sheets sit on a scrim                                                                           |
| Meaningless badges: NEW, BETA, AI, a pulsing green LIVE dot                                          | P1   | A badge only for real state (a stage, "Follow-up ready", "Offer received"), each colour with one meaning |
| Checkmarks in tinted circles; five-star rows; stock Aceternity / Magic UI effects                    | P1   | Ticks are plain stroke icons next to the reason they confirm                                             |
| Missing hover, active, disabled, loading and focus states                                            | P0   | Every interactive component ships all states; focus ring per 0005                                        |
| A modal for everything, including "Are you sure?" on reversible actions                              | P1   | Undo over confirm; overlays per 0006 §4; confirmation only for final actions (0006 §1b)                  |
| Toasts for everything                                                                                | P2   | Feedback inline, where the change happened                                                               |

## 5. Icons and imagery

| Tell                                                                                       | Sev. | Jubilee rule                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Emoji as icons (🚀 ✨ 📄)                                                                  | P0   | One in-house SVG set, 1.5 px stroke (0005). No emoji in UI                                                                             |
| A sparkle icon for AI; stock zap, rocket, shield icons                                     | P0   | AI actions are named verbs ("Tailor to this job"); no AI icon at all                                                                   |
| Placeholder avatars, initials in circles, grey logo boxes                                  | P1   | No avatar where there is no photo; companies shown by name. The CV preview is our main image                                           |
| Stock photos of smiling people; generated "too smooth" people; faceless flat illustrations | P0   | No stock or generated people. Playfulness comes from Jubilee's own spot illustrations (a decision of its own) and the confetti accents |
| Glossy abstract 3D shapes as hero art                                                      | P1   | None                                                                                                                                   |

## 6. Motion

| Tell                                                                                          | Sev. | Jubilee rule                                                                                        |
| --------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------- |
| Everything fades or slides up on scroll                                                       | P0   | Content is visible at first paint. Nothing animates on scroll                                       |
| Decorative loops: pulsing dots, bouncing arrows, typing headlines, auto-scrolling logo strips | P0   | Nothing loops                                                                                       |
| Count-up numbers                                                                              | P1   | The match score appears at its value                                                                |
| Every card lifts on hover, clickable or not; one `transition-all 300ms` everywhere            | P1   | Hover only on things that act; motion tokens (0005), fast in, soft out                              |
| Celebration on every action                                                                   | P1   | Confetti only for milestones the user earned: first application sent, an interview, an offer (0005) |
| `prefers-reduced-motion` ignored                                                              | P0   | Movement becomes a ≤ 120 ms fade                                                                    |

## 7. Copy (UI words)

| Tell                                                                                                                 | Sev. | Jubilee rule                                                          |
| -------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------- |
| "Elevate", "Seamless", "Powerful", "Unlock", "Supercharge", "Effortless", "Best-in-class", "Dream job", "AI-powered" | P0   | Say what it does: "Tailor to this job", "Send to Sawa Logistics"      |
| "Get started", "Learn more", arrows welded to buttons (`Explore →`)                                                  | P1   | Buttons start with a verb and name the action                         |
| "It's not X, it's Y" / "Not X. Y." slogans; three one-word adjectives ("Fast. Simple. Smart.")                       | P1   | One plain sentence about what the user gets                           |
| Hedged filler ("may help you", "can potentially")                                                                    | P2   | Say it, or don't                                                      |
| Long noun-heavy titles with no audience                                                                              | P1   | Short, specific, about the user's job search                          |
| Unverifiable social proof: round numbers, logos of non-customers, first-name testimonials, generated faces           | P0   | No social proof until it is real and sourced; never in the product UI |
| Greeting headlines with a wave ("Hey there 👋")                                                                      | P1   | The page starts with the user's work                                  |
| Labels that name the system ("Pipeline", "Entities", "Instance")                                                     | P1   | The brief's nouns: CV, version, application, stage, Today             |
| Vague errors ("Something went wrong", "Invalid input")                                                               | P0   | What happened and how to fix it                                       |
| Em dashes sprinkled for drama (our rule, not from a source)                                                          | P2   | Commas, colons and full stops                                         |

## 8. Behaviour and AI features

| Tell                                                                                  | Sev. | Jubilee rule                                                                                        |
| ------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------- |
| Happy path only: no empty, loading, error or partial states                           | P0   | Every spec lists its states; the reviewer screenshots each                                          |
| Controls that do nothing; "Coming soon" tabs; dead nav items                          | P0   | Only built features appear                                                                          |
| Lorem ipsum, `John Doe`, `$1,234` left in                                             | P0   | Realistic sample content in specs; never in production                                              |
| Settings nobody asked for (theme switcher, density toggle, 12 toggles)                | P1   | One control per real need                                                                           |
| A chatbot bolted onto a task that already works                                       | P1   | AI only where it does a job (tailoring, letters, import); no general chat box in the MVP            |
| AI output applied silently, or pre-filled fields the user must now check unprompted   | P0   | Marked changes the user accepts (0006 §1b); every change shows its reason                           |
| Confident AI claims with no source                                                    | P0   | Match reasons name the evidence ("Has 5 of 6 required skills"); AI never invents experience (brief) |
| Forms without validation, required markers or error states; keyboard and ARIA ignored | P0   | Native elements, labels, errors linked to fields, full keyboard path                                |
| Client components and `useEffect` fetching everywhere                                 | P1   | Server Components by default (0002)                                                                 |

## 9. Over-correcting (also slop)

Escaping the generic look by adding noise is its own tell: layered gradients, parallax on every section, custom cursors, animated backgrounds, a quirky font over vague copy. Fix the copy and the composition first; the colours last.

## 10. Borrowed from our references, made safe

Flovet chose Ownr's playfulness and colour and Clemta's grey-and-border structure (0005). Some of what those sites do is on this list; this is how we use the idea without the tell.

| Reference pattern                                     | Tell it risks                    | How Jubilee uses it                                                                              |
| ----------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| Ownr's violet buttons and navy-violet text            | Violet CTA default               | Flat violet, one per screen, navy-violet ink, warm confetti accents beside it; no gradient, ever |
| Ownr's coloured accent word in headlines              | Accent word                      | Not adopted                                                                                      |
| Ownr's pill eyebrows above section titles ("Why Us?") | Eyebrows                         | Not adopted; pills only carry state                                                              |
| Ownr's confetti and multicolour spot art              | Decoration for its own sake      | Confetti only at earned milestones; spot illustrations only in empty states, drawn for Jubilee   |
| Ownr's photo collages and testimonials                | Stock people, unverifiable proof | Not in the product UI                                                                            |
| Clemta's grey wells with light borders                | Borders around every block       | One containment level only: well → card. Never a card in a card                                  |
| Clemta's three-up feature grid with icons             | Three feature cards              | Not adopted in the product                                                                       |

## How to use this file

- **Before building:** write the screen's one-line direction in the spec and name its one memorable detail (for Today: the big match score with its reasons in words).
- **While building:** squint test. Blur the screenshot to blocks. Could it be anyone's? Change the composition, not the colours.
- **After building (reviewer):** walk sections 1–9 against the screenshots and the diff; rank hits P0/P1/P2; deduct per the reviewer rubric.

## Sources (opened 2026-11-21)

- Paralect, "Signs of AI slop in design: 21 patterns": https://www.paralect.com/blog/signs-of-ai-slop-in-design
- funboy322/avoid-ai-design README and tells catalogue: https://github.com/funboy322/avoid-ai-design · https://github.com/funboy322/avoid-ai-design/blob/main/references/ai-tells-catalog.md (first half read verbatim, second half via summary)
- 925Studios, "AI slop fonts and gradients" and the web design guide: https://www.925studios.co/blog/ai-slop-design-tells · https://www.925studios.co/blog/ai-slop-web-design-guide
- prg.sh, "Why your AI keeps building the same purple gradient website": https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- Anthropic `frontend-design` skill: https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md
- Smashing Magazine, "Should you actually add AI to that?" (AI behaviour): https://www.smashingmagazine.com/2026/11/should-you-add-ai-audit-product-teams/
- NN/g, "Can AI generate good designs from raw user data?": https://www.nngroup.com/articles/raw-data-vs-synthesized-data/
- FlickVale's no-ai-slop skill (local), for the structure
- Ownr (ownr.co) and Clemta (clemta.com) home pages, computed styles read in the browser, for section 10
- Agency and blog sources promote their own services; their lists are editorial claims. Reddit, Medium and uxdesign.cc refused automated fetches.
