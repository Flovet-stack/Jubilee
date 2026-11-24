/**
 * Sidebar panel icon for "Collapse / Expand sidebar" (0027). Drawn in-house
 * in the Hugeicons stroke style (24 grid, 1.5 stroke, round caps), static:
 * the button is pressed often, so the icon doesn't animate (0009).
 */
export function SidebarPanelIcon({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" />
        <path d="M9.5 2.5V21.5" />
        <path d="M5.5 7H6.5M5.5 10H6.5" />
      </svg>
    </span>
  );
}
