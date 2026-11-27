"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0009 and ./use-icon-accessibility.ts.

import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useRef } from "react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

import { useIconAccessibility } from "./use-icon-accessibility";

export interface HugeiconsArrowLeftIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
interface HugeiconsArrowLeftIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}
const PATH_VARIANTS: Variants = {
  normal: { d: "M 5 12 L 9 8 M 5 12 L 9 16", translateX: 0 },
  animate: {
    d: "M 5 12 L 9 8 M 5 12 L 9 16",
    translateX: [0, 3, 0],
    transition: {
      duration: 0.4,
    },
  },
};
const SECOND_PATH_VARIANTS: Variants = {
  normal: { d: "M 19 12 H 5" },
  animate: {
    d: ["M 19 12 H 5", "M19 12H10", "M 19 12 H 5"],
    transition: {
      duration: 0.4,
    },
  },
};
const HugeiconsArrowLeftIcon = forwardRef<
  HugeiconsArrowLeftIconHandle,
  HugeiconsArrowLeftIconProps
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
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M 5 12 L 9 8 M 5 12 L 9 16"
          animate={reduceDefinition(controls)}
          variants={PATH_VARIANTS}
        />
        <motion.path
          d="M 19 12 H 5"
          animate={reduceDefinition(controls)}
          variants={SECOND_PATH_VARIANTS}
        />
      </svg>
    </span>
  );
});
HugeiconsArrowLeftIcon.displayName = "HugeiconsArrowLeftIcon";
export { HugeiconsArrowLeftIcon };
