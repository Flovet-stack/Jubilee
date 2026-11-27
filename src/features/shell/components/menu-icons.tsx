import type { ReactNode } from "react";

export {
  HugeiconsCheckIcon as CheckGlyph,
  HugeiconsChevronLeftIcon as ChevronLeftGlyph,
  HugeiconsChevronRightIcon as ChevronRightGlyph,
  HugeiconsLanguageIcon as LanguageIcon,
  HugeiconsLogoutIcon as LogOutIcon,
  HugeiconsMoonIcon as MoonIcon,
} from "@/components/icons";

/**
 * Account-menu icons. AnimateIcons first (0051); the unfold chevrons have no
 * Huge equivalent, so they stay drawn here in the same stroke style. They
 * size to their slot (1lh, 0029/0030) and take the row's colour.
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

/** Up and down chevrons: the account button opens a menu (0035). */
export function UnfoldIcon() {
  return (
    <Glyph>
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    </Glyph>
  );
}
