import type { SVGProps } from "react";

/**
 * Six dots, the drag handle (0039). icons-animated has no grip, so it's
 * drawn here, static, on the same 24 px grid as MoreIcon (decision 0009).
 */
export function GripIcon({
  size = 20,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="9" cy="5" r="1.75" />
      <circle cx="15" cy="5" r="1.75" />
      <circle cx="9" cy="12" r="1.75" />
      <circle cx="15" cy="12" r="1.75" />
      <circle cx="9" cy="19" r="1.75" />
      <circle cx="15" cy="19" r="1.75" />
    </svg>
  );
}
