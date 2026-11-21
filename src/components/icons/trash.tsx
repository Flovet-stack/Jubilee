"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0009 and ./use-icon-accessibility.ts.

import type { Transition, Variants } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useRef } from "react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

import { useIconAccessibility } from "./use-icon-accessibility";

export interface HugeiconsTrashIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
interface HugeiconsTrashIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}
const LID_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: { y: -1.1 },
};
const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};
const HugeiconsTrashIcon = forwardRef<
  HugeiconsTrashIconHandle,
  HugeiconsTrashIconProps
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
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.g
          animate={reduceDefinition(controls)}
          transition={SPRING_TRANSITION}
          variants={LID_VARIANTS}
        >
          <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" />
        </motion.g>
        <motion.path
          d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
          animate={reduceDefinition(controls)}
          transition={SPRING_TRANSITION}
          variants={{
            normal: {
              d: "M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5",
            },
            animate: {
              d: "M19.5 6.5L18.8803 16.525100000000002C18.7219 19.0864 18.6428 20.3671 18.0008 21.2879 17.6833 21.7431 17.2747 22.1273 16.8007 22.416 15.8421 23 14.559 23 11.9927 23 9.42312 23 8.1383 23 7.17905 22.4149 6.7048 22.1257 6.296 21.7408 5.97868 21.2848 5.33688 20.3626 5.25945 19.0801 5.10461 16.5152L4.5 6.5",
            },
          }}
        />
        <motion.line
          x1="9.5"
          x2="9.5"
          y1="16.5"
          y2="10.5"
          animate={reduceDefinition(controls)}
          transition={SPRING_TRANSITION}
          variants={{
            normal: { y1: 16.5, y2: 10.5 },
            animate: { y1: 17, y2: 11 },
          }}
        />
        <motion.line
          x1="14.5"
          x2="14.5"
          y1="16.5"
          y2="10.5"
          animate={reduceDefinition(controls)}
          transition={SPRING_TRANSITION}
          variants={{
            normal: { y1: 16.5, y2: 10.5 },
            animate: { y1: 17, y2: 11 },
          }}
        />
      </svg>
    </span>
  );
});
HugeiconsTrashIcon.displayName = "HugeiconsTrashIcon";
export { HugeiconsTrashIcon };
