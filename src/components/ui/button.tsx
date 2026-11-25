"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";
import { Tooltip } from "./tooltip";

/**
 * Buttons (0007 shape, 0008 §1 explicitness and §5 hover/press, 0009 motion,
 * 0020 sizes, 0022 radius).
 *
 * - primary: the one violet action on a screen.
 * - secondary: card fill + field border.
 * - quiet: text only, for low-stakes actions next to a primary.
 * - danger: destructive final actions; the label names the target (0008 §1b).
 *
 * States: hover (fine pointers only, colour only), focus-visible (global ring),
 * pressed (scale 0.98 + darker fill), disabled, loading (keeps its width,
 * ignores clicks, announces busy). Labels wrap instead of clipping (French).
 *
 * Sizes (0020; 0029 sets them by font size): lg 16 px text → 40 px for
 * single-task screens, md 14 px → 35 px (the default), sm 12 px → 30 px for
 * inline row actions. Touch raises all three to 44 px through the tokens. Radius follows the size (0022). Never mix sizes
 * in a group.
 *
 * Spacing follows the type-spacing skill (0029): `.jb-type` in
 * components.css sets padding, gap and icon size from the label's line box
 * and cap height, so text, text + icon and icon-only buttons share one rule.
 * Don't add padding or gap at call sites.
 */
export const buttonVariants = cva(
  [
    "jb-type jb-button relative inline-flex shrink-0 cursor-pointer items-center justify-center text-center font-semibold select-none",
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
        lg: "jb-button-lg rounded-control-lg",
        md: "jb-button-md rounded-control",
        sm: "jb-button-sm rounded-control-sm",
      },
      iconOnly: {
        true: "jb-type-square",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      iconOnly: false,
      fullWidth: false,
    },
  },
);

/** Wraps an icon so it is one line box square, --py from its neighbours. */
function ButtonIcon({ icon }: { icon: ReactNode }) {
  if (icon == null || icon === false) return null;
  return (
    <span className="jb-type-icon" aria-hidden="true">
      {icon}
    </span>
  );
}

type ButtonBaseProps = Omit<ButtonPrimitive.Props, "className"> &
  Omit<VariantProps<typeof buttonVariants>, "iconOnly"> & {
    className?: string;
    /** Shows a spinner, keeps the width, blocks further clicks. */
    loading?: boolean;
    /** Read while loading, e.g. "Sending". Defaults to the visible label. */
    loadingLabel?: string;
    /** An icon before the label (decorative; sized to the line box). */
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
          "jb-type-content transition-opacity duration-(--dur-fast)",
          loading && "opacity-0",
        )}
      >
        <ButtonIcon icon={icon} />
        {children}
        <ButtonIcon icon={iconEnd} />
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
  /** Required: the accessible name and the tooltip text (0008: no mystery icons). */
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
      <span className="jb-type-icon">
        {loading ? <Spinner delay="none" /> : icon}
      </span>
    </ButtonPrimitive>
  );
  if (!tooltip) return button;
  return <Tooltip content={label}>{button}</Tooltip>;
}

type ButtonLinkProps = ComponentProps<typeof Link> &
  Omit<VariantProps<typeof buttonVariants>, "iconOnly"> & {
    /** An icon before the label (decorative; sized to the line box). */
    icon?: ReactNode;
  };

/**
 * A link that looks like a button, for navigation ("Create a CV"). Lives
 * here so server components can render it without calling `buttonVariants`.
 */
export function ButtonLink({
  className,
  variant,
  size,
  fullWidth,
  icon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        buttonVariants({ variant, size, fullWidth, iconOnly: false }),
        className,
      )}
      {...props}
    >
      <span className="jb-type-content">
        <ButtonIcon icon={icon} />
        {children}
      </span>
    </Link>
  );
}
