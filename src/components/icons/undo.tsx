"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0009 and ./use-icon-accessibility.ts.

import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useRef } from "react";
import { cubicBezier, motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

import { useIconAccessibility } from "./use-icon-accessibility";

export interface HugeiconsUndoIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
interface HugeiconsUndoIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}
const CUSTOM_EASING = cubicBezier(0.25, 0.1, 0.25, 1);
const HugeiconsUndoIcon = forwardRef<
  HugeiconsUndoIconHandle,
  HugeiconsUndoIconProps
>(({ onMouseEnter, onMouseLeave, className, size = 20, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);
  const {
    rootRef: iconRootRef,
    reduceDefinition,
    ...iconAccessibility
  } = useIconAccessibility(ref, () => {
    isControlledRef.current = ref != null;
    return {
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    };
  }, [controls]);
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (isControlledRef.current) {
        void e;
      } else {
        controls.start("animate");
      }
    },
    [controls],
  );
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (isControlledRef.current) {
        void e;
      } else {
        controls.start("normal");
      }
    },
    [controls],
  );
  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      {...props}
      ref={iconRootRef}
      onMouseEnter={(event) => {
        if (!iconAccessibility.isControlled() && !iconAccessibility.reduced) {
          handleMouseEnter(event);
        }
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        if (!iconAccessibility.isControlled()) {
          handleMouseLeave(event);
        }
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        if (!iconAccessibility.isControlled() && !iconAccessibility.reduced) {
          iconAccessibility.startAnimation();
        }
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!iconAccessibility.isControlled()) {
          iconAccessibility.stopAnimation();
        }
        props.onBlur?.(event);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <motion.path
          d="M 3.29339 3.00076 L 3.46556 5.05452 C 3.58958 6.53384 3.65159 7.27349 4.13359 7.68914 C 4.61559 8.10479 5.32673 8.03185 6.74899 7.88595 L 8.79339 7.67625"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          animate={reduceDefinition(controls)}
          transition={{
            duration: 0.6,
            ease: CUSTOM_EASING,
          }}
          variants={{
            normal: { translateX: 0, translateY: 0, rotate: 0 },
            animate: {
              translateX: [0, 2.1, 0],
              translateY: [0, -1.4, 0],
              rotate: [0, 12, 0],
            },
          }}
        />
        <motion.path
          d="M4.38341 7.20327C5.97733 4.67765 8.79275 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          animate={reduceDefinition(controls)}
          transition={{
            duration: 0.6,
            ease: CUSTOM_EASING,
          }}
          variants={{
            normal: { pathLength: 1 },
            animate: { pathLength: [1, 0.8, 1] },
          }}
        />
      </svg>
    </span>
  );
});
HugeiconsUndoIcon.displayName = "HugeiconsUndoIcon";
export { HugeiconsUndoIcon };
