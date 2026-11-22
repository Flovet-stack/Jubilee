/**
 * The Jubilee icon, "the steps" (decision 0019), drawn from
 * docs/design/brand/logo/jubilee-icon.svg: six equal dots in three rising
 * steps, the top one the marigold offer. The colours are the theme's violet
 * and marigold tokens, so it matches the on-dark file in dark mode.
 * Decorative where the page names Jubilee in text.
 */
const STEPS = [
  { cx: 28, cy: 68, opacity: 0.5 },
  { cx: 48, cy: 68, opacity: 0.65 },
  { cx: 48, cy: 48, opacity: 0.8 },
  { cx: 68, cy: 68, opacity: 0.8 },
  { cx: 68, cy: 48, opacity: 0.95 },
] as const;

export function JubileeIcon({
  height = 40,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="20.5 20.5 55 55"
      height={height}
      width={height}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {STEPS.map(({ cx, cy, opacity }) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={7.5}
          fill="var(--violet)"
          fillOpacity={opacity}
        />
      ))}
      <circle cx={68} cy={28} r={7.5} fill="var(--marigold)" />
    </svg>
  );
}
