// Icons (decision 0049): AnimateIcons' Huge set first, wrapped in our API;
// our own icons where it has no equivalent. Sources: ./icon-sources.ts.
export * from "./huge";
export type { IconAnimationHandle } from "./use-icon-accessibility";

// Fallback: our own icons.
export {
  HugeiconsLoaderCircleIcon,
  type HugeiconsLoaderCircleIconHandle,
} from "./loader-circle";
export { GripIcon } from "./grip";
