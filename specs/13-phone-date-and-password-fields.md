# 13: Phone, date and password fields

Status: Done (98/100, 2026-11-22) · Written: 2026-11-22

## Goal

Give every form one tested way to take a phone number, a date or date range, and a password. Each field meets the brief's component quality bar (reusable, every state, edge cases handled), so the CV editor, sign-up and later features don't each solve these again.

## Decisions

Implements [0021](../docs/decisions/0021-phone-date-and-password-fields.md). Builds on:

- [0009](../docs/decisions/0009-design-system-components-icons-motion.md): states and motion
- [0020](../docs/decisions/0020-control-sizes-and-density.md): sizes
- [0022](../docs/decisions/0022-corner-radius-by-size.md): radius
- [0016](../docs/decisions/0016-cv-data-model-and-pdf-rendering.md): date formats
- [0017](../docs/decisions/0017-regional-locales-and-cv-naming.md) and [0018](../docs/decisions/0018-locale-ids-are-url-segments.md): locales

## Acceptance criteria

1. **Dependencies.** Add libphonenumber-js, country-flag-icons, react-day-picker and date-fns, at the versions checked in 0021 or later patch releases. Nothing else.
2. **`PhoneField`** in `src/components/ui/phone-field.tsx`, as 0021 describes:
   - **Country button:** an SVG flag and the dial code. It opens a searchable Base UI Combobox that matches country names in the UI language and dial codes. Countries with no flag show their two-letter code.
   - **Default country:** from the locale (`en-us` → US, `en-gb` → GB, `fr-fr` → FR), overridable by prop.
   - **Typing:**
     - Free typing; no mask, and no reformatting while typing.
     - Pasting a `+` number switches the country.
     - Validated on blur and on submit with libphonenumber-js.
   - **Value:** `{ country, e164 }` through `onValueChange`, and a hidden input for forms.
   - **Display:** an existing value shows in the country's national format.
   - **Error:** gives an example number for the chosen country.
   - **Attributes:** `type="tel"`, `autoComplete="tel"`, `inputMode="tel"`.
3. **`DateField`** in `src/components/ui/date-field.tsx`, with `precision: "year" | "month" | "day"`:
   - **Year:** a typed year (4 digits).
   - **Month:** a month `Select` (names from the UI language) plus a typed year.
   - **Day:** a typed date in the locale's order, plus a calendar `IconButton` that opens React DayPicker in a Base UI Popover. The calendar is restyled fully with our tokens: no default DayPicker CSS, 0022 radius, 0009 popover motion.
   - **Typing is always enough** at every precision; the calendar is optional.
   - **Values** use 0016's formats: `YYYY`, `YYYY-MM`, `YYYY-MM-DD`. `min` and `max` are supported.
4. **`DateRangeField`** in the same file:
   - "From" and "To" fields at one precision.
   - An optional "Current" checkbox (label passed in) clears and disables "To". The value then has no end, as in 0016.
   - At `day` precision, one calendar picks the range: two months on screens 1024 px and wider, one below.
5. **`PasswordField`** in `src/components/ui/password-field.tsx`:
   - Hidden by default. A show/hide `IconButton` in the field's end slot uses the existing eye and eye-off icons, `aria-pressed`, and labels passed as props ("Show password" / "Hide password").
   - Hides again when its form submits. A Caps Lock hint shows while Caps Lock is on.
   - `autoComplete` comes from a `purpose: "current" | "new"` prop.
   - Paste allowed, no `maxLength`, `spellCheck={false}`, `autoCapitalize="off"`.
6. **Shared field behaviour.** All four:
   - wrap in `Field` (label, hint, optional mark, error)
   - take `size` (0020), `disabled`, `readOnly`, `invalid` through `Field`, and `className`
   - work controlled and uncontrolled
   - take every user-facing string as a prop, so the copy lives in the message files (decision 0003, now 0017)
7. **Copy.** The labels, hints, errors, month names and country names the fields need are in `en.json`, `en-GB.json` and `fr.json`, read through next-intl by callers. Country names come from `Intl.DisplayNames` in the UI language, not from a hand-written list.
8. **`/design-system`** shows each field in every state, at all three sizes, light and dark:
   - empty, filled, focus, hover, invalid with message, disabled, read-only
   - the calendar open
   - a range with "Current" ticked
   - a phone number pasted from another country
9. **Tests** (Vitest):
   - phone parsing and validation for US, GB, FR and CM numbers, including pasted `+` numbers and numbers with spaces, dots, dashes and brackets
   - date parsing in English and French (separators, missing leading zeros, month names and abbreviations), impossible dates, `min` and `max`, and an end before the start
   - the password field resets to hidden on submit

## Out of scope

- Using the fields in the CV editor or sign-up; those specs adopt them.
- SMS verification of phone numbers.
- Password strength rules (a later auth decision).
- Time pickers and calendars other than Gregorian.

## Edge cases

- **Phone:**
  - A number typed with no country chosen uses the default country.
  - A number valid for another country but not the chosen one shows the error, not a silent switch.
  - The country search with no match shows empty text.
  - Long country names (e.g. "Saint Vincent and the Grenadines") truncate in the button and wrap in the list.
- **Dates:**
  - 29 February in a non-leap year is an error.
  - An end before the start is an error on "To".
  - A month field with only a month (no year) is an error on the year.
  - French month input accepts "févr", "fevrier" and "février".
  - The calendar opens on the current value or today.
  - Escape closes the calendar and returns focus to its button.
  - Never auto-tab between parts.
- **Password:**
  - Two password fields on one page have distinct toggle labels.
  - Toggling keeps the caret position and focus in the input.
  - A browser or password manager filling the field doesn't break the toggle state.
- **All fields:**
  - French labels about 30% longer wrap.
  - Disabled and read-only fields can't open their popovers.
  - The fields work at 360 px.
  - On touch, every target is at least 44 px (0020).

## Files and patterns to follow

- `src/components/ui/field.tsx`: `Field`, `Input` (its `icon` and `end` slots), `controlClasses`, `controlHeight`, `controlRadius`.
- `src/components/ui/select.tsx` for Base UI popup styling and motion; `src/components/ui/tooltip.tsx` for Popover-style positioning.
- Base UI docs in `node_modules/@base-ui/react/docs/react/components/` (combobox, popover, field).
- `src/i18n/locales.ts` for the locale-to-country mapping.
- Flags: served as static files (`/flags/XX.svg`) by a route handler with `generateStaticParams`, so no page bundles the full flag set. This is an implementation detail of 0021's "SVG flags, loaded per country".

## Boundaries

- Always: tokens only; all copy through props; Base UI primitives for the popups; each dependency imported only by its own field.
- Ask first: any dependency beyond the four in 0021; a server round-trip for validation.
- Never: input masks; flag emoji; split day, month and year dropdowns; a confirm-password field; `maxLength` on passwords; DayPicker's default stylesheet.

## Check

- `pnpm check` passes.
- Bundle check: `/design-system` loads libphonenumber-js and DayPicker, while sign-in and the landing page don't. Check with `next build` output or the network panel.
- Screenshots of `/design-system` at 390 px (touch) and 1440 px, light and dark, with the phone list and the calendar open.
- A reviewer skill run against this spec and 0021 scores 90 or more.
