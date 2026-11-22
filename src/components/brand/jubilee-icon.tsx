/**
 * The Jubilee icon, "the path" (decision 0010), drawn from
 * docs/design/brand/logo/jubilee-icon.svg. The colours are the theme's
 * violet and marigold tokens, so it matches the on-dark file in dark mode.
 * Decorative where the page names Jubilee in text.
 */
export function JubileeIcon({
  height = 40,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="9 12 85 71"
      height={height}
      width={(height * 85) / 71}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g fill="var(--violet)">
        <circle cx="14" cy="78" r="5" />
        <circle cx="31" cy="68" r="6.5" />
        <circle cx="48" cy="56" r="8" />
        <circle cx="65" cy="42" r="9.5" />
      </g>
      <circle cx="82" cy="24" r="12" fill="var(--marigold)" />
    </svg>
  );
}
