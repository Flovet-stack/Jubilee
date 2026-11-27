"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0009 and ./use-icon-accessibility.ts.

import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

import { useIconAccessibility } from "./use-icon-accessibility";

export interface HugeiconsBellIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
interface HugeiconsBellIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}
const SVG_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0] },
};
const HugeiconsBellIcon = forwardRef<
  HugeiconsBellIconHandle,
  HugeiconsBellIconProps
>(
  (
    {
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      className,
      size = 20,
      ...props
    },
    ref,
  ) => {
    const controls = useAnimation();
    const motionPreference = useRef(false);
    const startAnimation = useCallback(() => {
      if (!motionPreference.current) return controls.start("animate");
    }, [controls]);
    const stopAnimation = useCallback(() => {
      if (motionPreference.current) {
        controls.stop();
        controls.set("normal");
        return;
      }
      return controls.start("normal");
    }, [controls]);
    useEffect(() => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const updatePreference = () => {
        motionPreference.current = media.matches;
        if (media.matches) {
          controls.stop();
          controls.set("normal");
        }
      };
      updatePreference();
      media.addEventListener("change", updatePreference);
      return () => {
        media.removeEventListener("change", updatePreference);
        controls.stop();
      };
    }, [controls]);
    const isControlledRef = useRef(false);
    const {
      rootRef: iconRootRef,
      reduceDefinition,
      ...iconAccessibility
    } = useIconAccessibility(ref, () => {
      isControlledRef.current = ref != null;
      return {
        startAnimation: () => startAnimation(),
        stopAnimation: () => stopAnimation(),
      };
    }, [controls]);
    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (!isControlledRef.current) startAnimation();
        void e;
      },
      [startAnimation],
    );
    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (!isControlledRef.current) stopAnimation();
        void e;
      },
      [stopAnimation],
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
            ((event) => {
              if (!isControlledRef.current) startAnimation();
              void event;
            })(event);
          }
          onFocus?.(event);
        }}
        onBlur={(event) => {
          if (!iconAccessibility.isControlled()) {
            ((event) => {
              if (!isControlledRef.current) stopAnimation();
              void event;
            })(event);
          }
          onBlur?.(event);
        }}
      >
        <motion.svg
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
          animate={reduceDefinition(controls)}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          variants={SVG_VARIANTS}
        >
          <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" />

          <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" />
        </motion.svg>
      </span>
    );
  },
);
HugeiconsBellIcon.displayName = "HugeiconsBellIcon";
export { HugeiconsBellIcon };
