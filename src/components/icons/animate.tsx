"use client";

import type {
  ForwardRefExoticComponent,
  HTMLAttributes,
  RefAttributes,
} from "react";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

import { useControlHover } from "./use-control-hover";
import type { IconAnimationHandle } from "./use-icon-accessibility";

type SourceIcon = ForwardRefExoticComponent<
  { size?: number; className?: string } & RefAttributes<IconAnimationHandle>
>;

export type WrappedIconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number;
};

/**
 * Wraps an AnimateIcons icon in our icon API (decision 0049): the same
 * `size`, span props and start/stop ref as our own icons. Holding a ref on
 * the source icon turns off its own hover, so we drive it: the surrounding
 * button or link plays it (`useControlHover`), else the icon's own hover.
 * AnimateIcons keeps still under reduced motion.
 */
export function fromAnimateIcons(Source: SourceIcon, displayName: string) {
  const Icon = forwardRef<IconAnimationHandle, WrappedIconProps>(
    (
      { size = 20, className, onPointerEnter, onPointerLeave, ...props },
      ref,
    ) => {
      const inner = useRef<IconAnimationHandle>(null);
      const root = useRef<HTMLSpanElement>(null);
      const api = useMemo<IconAnimationHandle>(
        () => ({
          startAnimation: () => inner.current?.startAnimation(),
          stopAnimation: () => inner.current?.stopAnimation(),
        }),
        [],
      );
      useImperativeHandle(ref, () => api, [api]);
      const hasControl = useControlHover(
        root,
        api.startAnimation,
        api.stopAnimation,
      );
      const ownHover = () => ref == null && !hasControl.current;

      return (
        <span
          {...props}
          ref={root}
          data-icon-source="animate"
          aria-hidden={props["aria-hidden"] ?? true}
          className={cn("inline-flex shrink-0", className)}
          onPointerEnter={(event) => {
            // Touch taps don't start it (0009), same as useControlHover.
            if (ownHover() && event.pointerType !== "touch")
              api.startAnimation();
            onPointerEnter?.(event);
          }}
          onPointerLeave={(event) => {
            if (ownHover()) api.stopAnimation();
            onPointerLeave?.(event);
          }}
        >
          <Source ref={inner} size={size} className="contents" />
        </span>
      );
    },
  );
  Icon.displayName = displayName;
  return Icon;
}
