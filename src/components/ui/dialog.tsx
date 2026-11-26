"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ReactElement, ReactNode } from "react";

import { HugeiconsXIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { IconButton } from "./button";

/**
 * Overlays (0008 §4): every one traps focus, closes with Esc and a visible
 * Close, returns focus to its trigger and locks the page scroll. Base UI does
 * the behaviour; these set the look and motion (0009 §3–4).
 */

const backdropClasses = cn(
  "fixed inset-0 z-40 bg-scrim",
  "transition-opacity duration-(--dur-base) ease-standard",
  "data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit)",
);

type OverlayProps = {
  /** The element that opens it (a Button). Omit when controlled. */
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** The visible Close button's label, e.g. "Close". */
  closeLabel: string;
  children?: ReactNode;
  /** Buttons at the bottom. Put the primary last; never the default focus for a final action. */
  footer?: ReactNode;
  /** Where focus goes on open. Default: the first focusable element. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  className?: string;
};

/**
 * Dialog: centred, max 480 px, for one short decision. Scales from 0.96 at
 * the centre in 200 ms; leaves in 150 ms. Long content scrolls inside.
 */
export function Dialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
  footer,
  initialFocus,
  className,
}: OverlayProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger render={trigger} /> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className={backdropClasses} />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPrimitive.Popup
            initialFocus={initialFocus}
            className={cn(
              "flex max-h-[calc(100dvh-2rem)] w-full max-w-(--container-dialog) flex-col rounded-sheet bg-card text-ink shadow-float outline-none",
              "transition-[opacity,scale] duration-(--dur-base) ease-enter",
              "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
              "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
              className,
            )}
          >
            <OverlayHeader
              title={title}
              description={description}
              closeLabel={closeLabel}
            />
            {children ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
                {children}
              </div>
            ) : null}
            {footer ? (
              <div className="flex flex-col-reverse gap-3 px-6 pt-4 pb-6 sm:flex-row sm:justify-end">
                {footer}
              </div>
            ) : (
              <div className="pb-4" />
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function OverlayHeader({
  title,
  description,
  closeLabel,
}: Pick<OverlayProps, "title" | "description" | "closeLabel">) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
      <div className="flex min-w-0 flex-col gap-1 pt-2">
        <DialogPrimitive.Title className="text-lg font-bold text-ink">
          {title}
        </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="text-sm text-ink-muted">
            {description}
          </DialogPrimitive.Description>
        ) : null}
      </div>
      <DialogPrimitive.Close
        render={
          <IconButton
            label={closeLabel}
            icon={<HugeiconsXIcon />}
            tooltip={false}
            className="-me-3"
          />
        }
      />
    </div>
  );
}

type SheetProps = OverlayProps & {
  /** bottom: phones; right: desktop side panel. "auto" picks by width. */
  side?: "auto" | "bottom" | "right";
};

/**
 * Sheet: a panel from the bottom on phones and from the right on desktop
 * (0008 §4). Moves with the iOS sheet curve in 320 ms, leaves in 150 ms.
 * Under reduced motion it fades in place.
 */
export function Sheet({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
  footer,
  initialFocus,
  side = "auto",
  className,
}: SheetProps) {
  const bottom = side === "bottom" || side === "auto";
  const right = side === "right" || side === "auto";
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger render={trigger} /> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className={backdropClasses} />
        <DialogPrimitive.Popup
          initialFocus={initialFocus}
          className={cn(
            "fixed z-50 flex flex-col bg-card text-ink shadow-float outline-none",
            "transition-[translate,opacity] duration-(--dur-slow) ease-sheet",
            "data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
            "motion-reduce:transition-opacity motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:opacity-0",
            bottom && [
              "inset-x-0 bottom-0 max-h-[min(90dvh,calc(100dvh-3rem))] rounded-t-sheet pb-[env(safe-area-inset-bottom)]",
              "data-ending-style:translate-y-full data-starting-style:translate-y-full",
            ],
            right && [
              side === "auto"
                ? "lg:inset-x-auto lg:inset-y-0 lg:end-0 lg:max-h-none lg:w-[28rem] lg:rounded-none lg:rounded-s-sheet lg:pb-0"
                : "inset-y-0 end-0 w-[min(28rem,100vw)] rounded-s-sheet",
              side === "auto"
                ? "lg:data-ending-style:translate-x-full lg:data-ending-style:translate-y-0 lg:data-starting-style:translate-x-full lg:data-starting-style:translate-y-0"
                : "data-ending-style:translate-x-full data-starting-style:translate-x-full",
            ],
            "motion-reduce:data-ending-style:translate-0 motion-reduce:data-starting-style:translate-0",
            side !== "bottom" &&
              "lg:motion-reduce:data-ending-style:translate-0 lg:motion-reduce:data-starting-style:translate-0",
            className,
          )}
        >
          {bottom ? (
            <span
              aria-hidden="true"
              className={cn(
                "mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line",
                side === "auto" && "lg:hidden",
              )}
            />
          ) : null}
          <OverlayHeader
            title={title}
            description={description}
            closeLabel={closeLabel}
          />
          {children ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4">
              {children}
            </div>
          ) : null}
          {footer ? (
            <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** A button inside a Dialog or Sheet that closes it, e.g. "Cancel". */
export function OverlayClose({ children }: { children: ReactElement }) {
  return <DialogPrimitive.Close render={children} />;
}
