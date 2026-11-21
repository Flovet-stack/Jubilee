"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Wrap a region (the app shell) once. After the first tooltip opens, its
 * neighbours open with no delay and no animation (Emil Kowalski; 0007 §6).
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delay={500} closeDelay={0}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

type TooltipProps = {
  /** Short text, under ~80 characters. Never the only label of a control. */
  content: ReactNode;
  /** One focusable element: the trigger. */
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
};

/**
 * Tooltip (0006 §4: hint only). Opens on hover after 500 ms and immediately on
 * keyboard focus; grows from its trigger, from scale 0.96, in 120 ms.
 */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          side={side}
          sideOffset={8}
          collisionPadding={16}
          className="z-50"
        >
          <TooltipPrimitive.Popup
            className={cn(
              "max-w-64 rounded-control bg-ink px-2.5 py-1.5 text-sm font-medium text-page shadow-float",
              "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-fast) ease-enter",
              "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
              "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
              "data-instant:transition-none",
            )}
          >
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
