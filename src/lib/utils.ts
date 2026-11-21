import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Class-name merging that knows our theme names (decision 0009), so
 * `shadow-float` replaces `shadow-paper` and `rounded-box` replaces
 * `rounded-control` instead of both staying.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["paper", "mark", "control", "box", "sheet"],
      shadow: ["paper", "float"],
      ease: ["standard", "enter", "exit", "sheet"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
