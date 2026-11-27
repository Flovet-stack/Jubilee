/**
 * Where each exported icon comes from (decision 0051). "animate" is
 * AnimateIcons' Huge set wrapped in our API; "ours" is the fallback, kept
 * where the Huge set has no equivalent. A test keeps this in step with
 * ./index.ts.
 */
export type IconSource = "animate" | "ours";

export const OUR_ICONS = ["HugeiconsLoaderCircleIcon", "GripIcon"] as const;

/** Drawn outside this folder and kept: no Huge equivalent. */
export const OUR_GLYPHS = [
  "UnfoldIcon (account menu)",
  "Checkbox tick (component state)",
] as const;

export function iconSource(name: string): IconSource {
  return (OUR_ICONS as readonly string[]).includes(name) ? "ours" : "animate";
}
