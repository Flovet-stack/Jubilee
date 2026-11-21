"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0009 and ./use-icon-accessibility.ts.

import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { motion, useAnimation, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { useControlHover } from "./use-control-hover";

export interface HugeiconsFilterIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface HugeiconsFilterIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const FILTER_VARIANTS: Variants = {
  normal: {
    transition: { duration: 0.18, delay: 0, ease: "easeOut" },
    scale: 1,
  },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const HugeiconsFilterIcon = forwardRef<
  HugeiconsFilterIconHandle,
  HugeiconsFilterIconProps
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
    const reducedMotion = useReducedMotion();
    const motionPreference = useRef(reducedMotion);
    const sequence = useRef(0);
    const startAnimation = useCallback(() => {
      const current = ++sequence.current;
      controls.stop();
      controls.set("normal");
      if (motionPreference.current) return;
      void controls.start("animate").then(() => {
        if (sequence.current === current) controls.set("normal");
      });
    }, [controls]);
    const stopAnimation = useCallback(() => {
      const current = ++sequence.current;
      controls.stop();
      if (motionPreference.current) {
        controls.set("normal");
        return;
      }
      void controls.start("normal").then(() => {
        if (sequence.current === current) controls.set("normal");
      });
    }, [controls]);
    useImperativeHandle(ref, () => ({ startAnimation, stopAnimation }), [
      startAnimation,
      stopAnimation,
    ]);
    useEffect(() => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const updatePreference = () => {
        motionPreference.current = media.matches;
        if (media.matches) {
          sequence.current += 1;
          controls.stop();
          controls.set("normal");
        }
      };
      updatePreference();
      media.addEventListener("change", updatePreference);
      return () => {
        media.removeEventListener("change", updatePreference);
        sequence.current += 1;
        controls.stop();
      };
    }, [controls]);

    const rootRef = useRef<HTMLSpanElement | null>(null);

    const hasControl = useControlHover(rootRef, startAnimation, stopAnimation);

    return (
      <span
        {...props}
        ref={rootRef}
        className={cn("inline-flex shrink-0", className)}
        onMouseEnter={(event) => {
          if (!ref && !hasControl.current) startAnimation();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          if (!ref && !hasControl.current) stopAnimation();
          onMouseLeave?.(event);
        }}
        onFocus={(event) => {
          if (!ref && !hasControl.current) startAnimation();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          if (!ref && !hasControl.current) stopAnimation();
          onBlur?.(event);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          overflow="visible"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ overflow: "visible" }}
        >
          <motion.g
            initial="normal"
            variants={FILTER_VARIANTS}
            animate={controls}
          >
            <path d="M4 6H20M7 12H17M10 18H14" />
          </motion.g>
        </svg>
      </span>
    );
  },
);

HugeiconsFilterIcon.displayName = "HugeiconsFilterIcon";

export { HugeiconsFilterIcon };
