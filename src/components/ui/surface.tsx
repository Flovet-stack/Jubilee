import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Containment (0005, Clemta pattern; 0006 §3): a grey Well holds white Cards.
 * One level only: never a Card in a Card, never a Well in a Well. Resting
 * surfaces have no shadow.
 */

type WellProps = ComponentProps<"section"> & {
  /** Visible group title (h2 by default). Omit when the page heading covers it. */
  title?: ReactNode;
  titleAs?: "h2" | "h3";
  /** Right side of the title row: a count, a quiet action. */
  actions?: ReactNode;
};

export function Well({
  title,
  titleAs: Heading = "h2",
  actions,
  className,
  children,
  ...props
}: WellProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-box bg-well p-3 shadow-[inset_0_0_0_1px_var(--line)] sm:p-4",
        className,
      )}
      {...props}
    >
      {title || actions ? (
        <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
          {title ? (
            <Heading className="text-base font-bold text-ink">{title}</Heading>
          ) : null}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const cardBase =
  "flex min-w-0 flex-col gap-2 rounded-box bg-card p-4 text-ink shadow-[inset_0_0_0_1px_var(--line)]";

type CardProps = ComponentProps<"div">;

/** A static card: content only, no hover. */
export function Card({ className, ...props }: CardProps) {
  return <div className={cn(cardBase, className)} {...props} />;
}

type CardLinkProps = ComponentProps<typeof Link>;

/**
 * A card that opens something. Only clickable cards change on hover: the
 * border darkens to --field (0006 §5). Press scales to 0.98. The whole card is
 * the link, so keep only one link inside it.
 */
export function CardLink({ className, ...props }: CardLinkProps) {
  return (
    <Link
      className={cn(
        cardBase,
        "cursor-pointer transition-[box-shadow,scale] duration-(--dur-exit) ease-standard",
        "hover-fine:shadow-[inset_0_0_0_1px_var(--field)] hover-fine:duration-(--dur-fast)",
        "active:scale-(--press-scale) active:duration-(--dur-fast)",
        "focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}

type NextStepProps = {
  title: ReactNode;
  children?: ReactNode;
  /** Usually the screen's one primary Button. */
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/**
 * The "next step" panel (0005): a tint panel for the single next action of a
 * screen, e.g. "2 follow-ups are ready". At most one per screen.
 */
export function NextStep({
  title,
  children,
  action,
  icon,
  className,
}: NextStepProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-box bg-tint p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? <span className="mt-0.5 flex text-violet">{icon}</span> : null}
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {children ? (
            <div className="text-sm text-ink-muted">{children}</div>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}
