"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";
import { Tooltip } from "./tooltip";

/**
 * Buttons (0005 shape, 0006 §1 explicitness and §5 hover/press, 0007 motion).
 *
 * - primary: the one violet action on a screen.
 * - secondary: card fill + field border.
 * - quiet: text only, for low-stakes actions next to a primary.
 * - danger: destructive final actions; the label names the target (0006 §1b).
 *
 * States: hover (fine pointers only, colour only), focus-visible (global ring),
 * pressed (scale 0.98 + darker fill), disabled, loading (keeps its width,
 * ignores clicks, announces busy). Labels wrap instead of clipping (French).
 */
export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control text-center font-semibold select-none",
    "transition-[background-color,border-color,color,scale] duration-(--dur-exit) ease-standard hover-fine:duration-(--dur-fast)",
    "active:scale-(--press-scale) active:duration-(--dur-fast)",
    "data-disabled:cursor-not-allowed data-disabled:active:scale-100",
    "[&_svg]:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-violet text-on-violet",
          "hover-fine:bg-[color-mix(in_oklab,var(--violet)_88%,var(--ink))] active:bg-violet-press",
          "data-disabled:bg-well data-disabled:text-ink-subtle data-disabled:shadow-[inset_0_0_0_1px_var(--line)]",
        ],
        secondary: [
          "bg-card text-ink shadow-[inset_0_0_0_1px_var(--field)]",
          "hover-fine:bg-[color-mix(in_oklab,var(--card),var(--ink)_6%)] active:bg-[color-mix(in_oklab,var(--card),var(--ink)_12%)]",
          "data-disabled:bg-well data-disabled:text-ink-subtle data-disabled:shadow-[inset_0_0_0_1px_var(--line)]",
        ],
        quiet: [
          "bg-transparent text-ink",
          "hover-fine:bg-wash-hover active:bg-wash-press",
          "data-disabled:text-ink-subtle data-disabled:bg-transparent",
        ],
        danger: [
          "bg-card text-danger shadow-[inset_0_0_0_1px_var(--danger)]",
          "hover-fine:bg-wash-danger active:bg-[color-mix(in_oklab,var(--danger)_18%,transparent)]",
          "data-disabled:bg-well data-disabled:text-ink-subtle data-disabled:shadow-[inset_0_0_0_1px_var(--line)]",
        ],
      },
      size: {
        md: "min-h-(--control-h) px-5 py-2 text-base",
        sm: "min-h-(--control-h-sm) px-4 py-1.5 text-sm",
      },
      iconOnly: {
        true: "px-0 py-0",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "md", className: "size-(--control-h)" },
      { iconOnly: true, size: "sm", className: "size-(--control-h-sm)" },
    ],
    defaultVariants: {
      variant: "secondary",
      size: "md",
      iconOnly: false,
      fullWidth: false,
    },
  },
);

type ButtonBaseProps = Omit<ButtonPrimitive.Props, "className"> &
  Omit<VariantProps<typeof buttonVariants>, "iconOnly"> & {
    className?: string;
    /** Shows a spinner, keeps the width, blocks further clicks. */
    loading?: boolean;
    /** Read while loading, e.g. "Sending". Defaults to the visible label. */
    loadingLabel?: string;
    /** An icon before the label (20 px, decorative). */
    icon?: ReactNode;
    /** An icon after the label, e.g. a chevron or external-link. */
    iconEnd?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  loadingLabel,
  icon,
  iconEnd,
  disabled,
  children,
  onClick,
  ...props
}: ButtonBaseProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, fullWidth, iconOnly: false }),
        className,
      )}
      disabled={disabled}
      // A loading button stays focusable so focus isn't lost mid-submit.
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-opacity duration-(--dur-fast)",
          loading && "opacity-0",
        )}
      >
        {icon}
        {children}
        {iconEnd}
      </span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner delay="none" />
          {loadingLabel ? (
            <span className="sr-only" role="status">
              {loadingLabel}
            </span>
          ) : null}
        </span>
      ) : null}
    </ButtonPrimitive>
  );
}

type IconButtonProps = Omit<
  ButtonBaseProps,
  "icon" | "iconEnd" | "children"
> & {
  /** Required: the accessible name and the tooltip text (0006: no mystery icons). */
  label: string;
  icon: ReactNode;
  /** Hide the tooltip when the label is already visible nearby. */
  tooltip?: boolean;
};

/**
 * Icon-only button: square, same heights as Button, always named. Shows its
 * label as a tooltip on hover and keyboard focus, never as the only label.
 */
export function IconButton({
  label,
  icon,
  tooltip = true,
  className,
  variant = "quiet",
  size,
  loading = false,
  disabled,
  onClick,
  ...props
}: IconButtonProps) {
  const button = (
    <ButtonPrimitive
      data-slot="icon-button"
      aria-label={label}
      className={cn(
        buttonVariants({ variant, size, iconOnly: true }),
        className,
      )}
      disabled={disabled}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {loading ? <Spinner delay="none" /> : icon}
    </ButtonPrimitive>
  );
  if (!tooltip) return button;
  return <Tooltip content={label}>{button}</Tooltip>;
}
