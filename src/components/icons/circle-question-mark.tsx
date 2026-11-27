"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0009 and ./use-icon-accessibility.ts.

import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useRef } from "react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

import { useIconAccessibility } from "./use-icon-accessibility";

export interface HugeiconsCircleQuestionMarkIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
interface HugeiconsCircleQuestionMarkIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}
const VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0] },
};
const HugeiconsCircleQuestionMarkIcon = forwardRef<
  HugeiconsCircleQuestionMarkIconHandle,
  HugeiconsCircleQuestionMarkIconProps
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
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
        <motion.g
          animate={reduceDefinition(controls)}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          variants={VARIANTS}
        >
          <path
            d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
          <path
            d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </motion.g>
      </svg>
    </span>
  );
});
HugeiconsCircleQuestionMarkIcon.displayName = "HugeiconsCircleQuestionMarkIcon";
export { HugeiconsCircleQuestionMarkIcon };
