import type { ReactNode } from "react";

/**
 * Static icons for the account menu, drawn in-house in the Hugeicons
 * stroke style (24 grid, round caps), like the sidebar panel icon. The set
 * (icons-animated) has no moon, language or log-out glyph. They size to
 * their slot (1lh, 0029/0030) and take the row's colour.
 */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="size-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function MoonIcon() {
  return (
    <Glyph>
      <path d="M21.5 14.08A9.5 9.5 0 0 1 9.92 2.5 9.5 9.5 0 1 0 21.5 14.08Z" />
    </Glyph>
  );
}

export function LanguageIcon() {
  return (
    <Glyph>
      <path d="M3 5h9M7.5 3v2M10 5c-.8 4-3.4 7.2-6.5 8.5M5.5 8.5c1 2 2.8 3.6 5 4.5" />
      <path d="M12.5 21l4-10 4 10M14 17.5h5" />
    </Glyph>
  );
}

export function LogOutIcon() {
  return (
    <Glyph>
      <path d="M14 3.5h-2.5c-3.3 0-5 0-6 1s-1 2.7-1 6v3c0 3.3 0 5 1 6s2.7 1 6 1H14" />
      <path d="M10 12h10.5M17.5 8.5 21 12l-3.5 3.5" />
    </Glyph>
  );
}

/** Up and down chevrons: the account button opens a menu (0035). */
export function UnfoldIcon() {
  return (
    <Glyph>
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    </Glyph>
  );
}

export function ChevronRightGlyph() {
  return (
    <Glyph>
      <path d="M9 6l6 6-6 6" />
    </Glyph>
  );
}

export function ChevronLeftGlyph() {
  return (
    <Glyph>
      <path d="M15 6l-6 6 6 6" />
    </Glyph>
  );
}

export function CheckGlyph() {
  return (
    <Glyph>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Glyph>
  );
}
