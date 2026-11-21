import { cn } from "@/lib/utils";

type SpinnerProps = {
  /** Read by screen readers. Omit only inside a control that has `aria-busy`. */
  label?: string;
  /** Shown after this delay so quick work doesn't flash (0009 §8). */
  delay?: "none" | "default";
  size?: number;
  className?: string;
};

/**
 * Loading indicator: a 270° arc turning at 700 ms per turn. The only looping
 * motion allowed (0009 §8); under reduced motion it turns slowly.
 */
export function Spinner({
  label,
  delay = "default",
  size = 20,
  className,
}: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0", className)}
    >
      <svg
        className="jb-spinner"
        style={
          delay === "none"
            ? ({ "--spinner-delay": "0ms" } as React.CSSProperties)
            : undefined
        }
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="2"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
