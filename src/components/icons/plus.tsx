"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0009 and ./use-icon-accessibility.ts.

import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

import { useIconAccessibility } from "./use-icon-accessibility";

export interface HugeiconsPlusIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
interface HugeiconsPlusIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}
const HugeiconsPlusIcon = forwardRef<
  HugeiconsPlusIconHandle,
  HugeiconsPlusIconProps
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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={reduceDefinition(controls)}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          variants={{
            normal: {
              rotate: 0,
            },
            animate: {
              rotate: 180,
            },
          }}
        >
          <path d="M12 4V20M20 12H4" />
        </motion.svg>
      </span>
    );
  },
);
HugeiconsPlusIcon.displayName = "HugeiconsPlusIcon";
export { HugeiconsPlusIcon };
