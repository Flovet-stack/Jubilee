"use client";

// Vendored from icons-animated (Hugeicons set), MIT. See ./LICENSE and
// ./THIRD_PARTY_NOTICES.md. Edits: decision 0007 and ./use-icon-accessibility.ts.

import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

import { useIconAccessibility } from "./use-icon-accessibility";

export interface HugeiconsBriefcaseBusinessIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
interface HugeiconsBriefcaseBusinessIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}
const SWAY_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  animate: {
    rotate: [0, 4, -3, 2, 0],
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};
const HugeiconsBriefcaseBusinessIcon = forwardRef<
  HugeiconsBriefcaseBusinessIconHandle,
  HugeiconsBriefcaseBusinessIconProps
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
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
          animate={reduceDefinition(controls)}
          initial="normal"
          style={{ transformOrigin: "12px 4px" }}
          variants={SWAY_VARIANTS}
        >
          <path
            d="M18.4816 6.50003C19.904 6.50002 20.6151 6.50002 21.1239 6.84569C21.3326 6.98746 21.5126 7.16742 21.6543 7.37609C22 7.8849 22 8.59649 22 10.0197C22 11.0504 22 11.5657 21.7863 11.99C21.6978 12.1659 21.5837 12.3278 21.4478 12.4704C21.1201 12.8143 20.6347 12.9876 19.6641 13.3343L15.6525 14.7669C15.327 14.8831 15.1643 14.9413 14.9949 14.9706C14.8255 14.9999 14.6527 14.9999 14.3072 14.9999H9.69282C9.34726 14.9999 9.17449 14.9999 9.00508 14.9706C8.83568 14.9413 8.67296 14.8831 8.34754 14.7669L4.33591 13.3343C3.36526 12.9876 2.87994 12.8143 2.55217 12.4704C2.4163 12.3278 2.30223 12.1659 2.21366 11.99C2 11.5657 2 11.0504 2 10.0197C2 8.59645 2 7.88484 2.34569 7.37603C2.48746 7.16737 2.66742 6.98741 2.87608 6.84565C3.3849 6.49997 4.09607 6.49998 5.51841 6.5L18.4816 6.50003Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />

          <path
            d="M15.5 6C15.5 5.06812 15.5 4.60218 15.3478 4.23463C15.1448 3.74458 14.7554 3.35523 14.2654 3.15224C13.8978 3 13.4319 3 12.5 3H11.5C10.5681 3 10.1022 3 9.73463 3.15224C9.24458 3.35523 8.85523 3.74458 8.65224 4.23463C8.5 4.60218 8.5 5.06812 8.5 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />

          <path
            d="M21 13V15C21 17.8284 21 19.2426 20.1213 20.1213C19.2426 21 17.8284 21 15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15V13"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />

          <path
            d="M12 15V17"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </motion.svg>
      </span>
    );
  },
);
HugeiconsBriefcaseBusinessIcon.displayName = "HugeiconsBriefcaseBusinessIcon";
export { HugeiconsBriefcaseBusinessIcon };
