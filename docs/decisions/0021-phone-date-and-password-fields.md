# 0021: Phone, date and password fields

- **Status:** Approved
- **Proposed:** 2026-11-22 by the product team (roles: UX, UI, Frontend, Copy, Tech Lead)
- **Approved:** 2026-11-22 by Flovet (in chat)
- **Supersedes:** none. Adds three fields to 0009's component set; built on 0009's tokens and 0020's sizes.
- **Specs:** specs/13-phone-date-and-password-fields.md

## Context

Flovet asked for three fields the design system doesn't have yet:

- **Phone:** with a country code and flag. CVs and applications carry a phone number, and the launch markets mix countries (0005, 0017).
- **Date and date range:** with a proper picker. CVs store dates as `YYYY`, `YYYY-MM` or `YYYY-MM-DD`; no end date means "current" (0016). Other features will need near dates, like interviews and follow-ups.
- **Password:** with a show/hide (eye) toggle.

They must follow the current principles: 0007 look, 0008 explicitness and disclosure, 0009 states and motion, 0020 sizes, and the component quality bar in the brief.

## Research

| Reference                         | What they do                                                                                                                                                                                                                                                     | Adopt / adapt / reject  | Why                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| GOV.UK, telephone numbers pattern | Accept spaces, hyphens, brackets and country codes. Validate with Google's libphonenumber. `autocomplete="tel"` (needed for WCAG 1.3.5). No input masking. Don't reformat what the user typed: Notify users were confused when a number came back with +44 added | Adopt                   | Typing stays free; validation catches real mistakes                                          |
| libphonenumber-js 1.13.17 (MIT)   | JavaScript port of Google's libphonenumber: parse, validate, format to E.164, per-country example numbers                                                                                                                                                        | Adopt                   | The standard GOV.UK points to, small "min" metadata build, MIT                               |
| country-flag-icons 1.6.20 (MIT)   | SVG flags for every country code                                                                                                                                                                                                                                 | Adopt                   | Flag emoji don't render on Windows (they show as two letters); SVGs look the same everywhere |
| GOV.UK, date input component      | Three typed fields (day, month, year) for dates people know or can look up, like a date of birth. Never auto-tab. Accept "jan" or "january". Highlight only the wrong field                                                                                      | Adopt for known dates   | CV dates are known dates; typing is faster than paging a calendar back years                 |
| NN/g, date input (2017)           | Pickers for dates within about a year; let people type even when a picker exists; no split dropdowns for day, month and year; don't require separators; pickers suit ranges, often two months side by side                                                       | Adopt                   | Sets when a calendar appears and when typing wins                                            |
| React DayPicker 10.0.2 (MIT)      | Calendar with single, multiple and range modes; WCAG 2.1 AA; localised (date-fns 4.4.0, MIT)                                                                                                                                                                     | Adopt for near dates    | Accessible range picker we restyle with our tokens; Base UI 1.9 has no calendar              |
| GOV.UK, password input            | Hidden by default with a "Show" button; labels differ when there are two fields; no confirm field; switch back to hidden on submit; `new-password` / `current-password`; always allow paste; no `maxlength`; `spellcheck="false"`, `autocapitalize="off"`        | Adopt                   | Every rule maps to an edge case we must handle                                               |
| NN/g, stop password masking       | Masking causes more typing errors and simpler passwords; offer a way to see the password                                                                                                                                                                         | Adopt (as the toggle)   | Supports a visible toggle; we keep masking as the default because CVs hold sensitive data    |
| Base UI 1.9 (installed)           | Has Combobox, Popover, Field, Input; no date picker or phone field                                                                                                                                                                                               | Adopt as the primitives | The country list is a Combobox (type to search); the calendar sits in a Popover              |

Sources (links actually opened):

- https://design-system.service.gov.uk/patterns/telephone-numbers/
- https://design-system.service.gov.uk/components/date-input/
- https://design-system.service.gov.uk/components/password-input/
- https://www.nngroup.com/articles/date-input/
- https://www.nngroup.com/articles/stop-password-masking/
- https://daypicker.dev/
- Package versions and licences from the npm registry (`npm view`), 2026-11-22. The npm web pages returned 403, and Baymard's phone-field articles are behind a paywall.
- Not verified from a source: flag emoji showing as letters on Windows (widely known, not checked today).

## Options

1. **Native inputs only** (`type="tel"`, `type="date"`, a plain password input).
   - Pros: no dependencies.
   - Cons: no country or flag, no validation. The native date picker looks and behaves differently in each browser and can't do ranges. No show/hide toggle.
2. **A full form-kit library** (a ready-made phone input and date picker with their own styles).
   - Pros: fast.
   - Cons: their own look and markup fight our tokens (the no-ai-slop rule against default-library looks), and two ways of doing the same thing.
3. **Our own three fields on Base UI, plus three small MIT libraries for the hard parts** (phone rules, flags, calendar maths and grid).
   - Pros: our look, our states, accessible primitives.
   - Cons: more to build and test.

## Decision

**Option 3.** All three are built on `Field` (label, hint, error, optional mark) and follow 0020's sizes.

**`PhoneField`**

- A country button (SVG flag and `+33`) opens a searchable list: a Base UI Combobox that matches country names in English and French and calling codes.
- The default country comes from the locale (`en-us` → US, `en-gb` → GB, `fr-fr` → FR). Pasting a number that starts with `+` picks the country.
- Free typing: no mask, and what the user typed is never reformatted while they type.
- Validated with libphonenumber-js when the field loses focus or the form is submitted. The error gives an example number for the chosen country.
- Stored as E.164 (`+33612345678`) with the country code. Shown back in that country's national format.
- `type="tel"`, `autocomplete="tel"`, `inputMode="tel"`.

**`DateField`** comes in three precisions; the feature picks one:

| Precision | How it's entered                                                                                 | For                                     |
| --------- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `year`    | Typed year                                                                                       | Graduation year, CV dates with no month |
| `month`   | Month `Select` (names in the UI language) + typed year                                           | Most CV dates ("Jan 2021")              |
| `day`     | Typed date in the locale's order, plus a calendar button that opens React DayPicker in a Popover | Near dates: interviews, follow-ups      |

**`DateRangeField`**: two `DateField`s ("From", "To") of the same precision, plus a "Current" checkbox that clears and disables "To" (0016: no end date = current). At `day` precision, one calendar picks the range: two months side by side on desktop, one on phones.

- Rules for every date field:
  - Typing always works, and the calendar is optional.
  - Accept any separator, missing leading zeros, and month names or abbreviations in English and French.
  - Never auto-tab.
  - The error names the field that's wrong. An end before the start is an error on "To".
  - `min` and `max` dates are supported.
  - Dates are stored in the 0016 formats, and the calendar opens on the chosen date or today.

**`PasswordField`**

- Hidden by default. An eye `IconButton` inside the field toggles it, with the label "Show password" / "Hide password", using the existing eye and eye-off icons and `aria-pressed`. Two fields get distinct labels.
- Switches back to hidden on submit. No confirm field.
- `autocomplete` is `current-password` or `new-password`. Paste allowed, no `maxlength`, `spellcheck="false"`, `autocapitalize="off"`.
- Caps Lock on shows a hint under the field.

**Dependencies** (approval of this decision approves them): libphonenumber-js, country-flag-icons, react-day-picker and date-fns (react-day-picker depends on date-fns). All MIT. Each loads only where its field is used.

## Consequences

- Easier: every form with a phone, a date or a password uses one tested field, with the same states and edge cases.
- Harder: four new dependencies to keep current; the calendar needs a full restyle to our tokens; flag SVGs must be loaded per country, not as one bundle.
- Rules out: split dropdowns for day, month and year; input masks; flag emoji; a "confirm password" field.
- Implementation needs its own spec: the three fields and the range field, every state (empty, filled, focus, hover, invalid, disabled, read-only, loading where relevant), `/design-system` examples, and unit tests for parsing (phone, dates in both languages) and validation.
- Reviews check: no reformatting while typing; E.164 storage; typing works without the calendar; date errors name the field; the password resets to hidden on submit; touch sizes follow 0020.
