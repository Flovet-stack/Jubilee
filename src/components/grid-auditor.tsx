"use client";

import { useEffect } from "react";

const STORAGE_KEY = "grid-auditor";

/**
 * Reads and updates the production opt-in: `?grid=1` saves it, `?grid=0`
 * removes it (decision 0034). Blocked storage counts as off.
 */
function optedIn(): boolean {
  const param = new URLSearchParams(window.location.search).get("grid");
  try {
    if (param === "1") window.localStorage.setItem(STORAGE_KEY, "1");
    if (param === "0") window.localStorage.removeItem(STORAGE_KEY);
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return param === "1";
  }
}

function isEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  // Read directly so Next inlines it; importing `@/env` would ship zod to every page (0034).
  if (process.env.NEXT_PUBLIC_GRID_AUDITOR !== "true") return false;
  return optedIn();
}

/** Loads the grid-auditor overlay on demand (decision 0034). Renders nothing. */
export function GridAuditor() {
  useEffect(() => {
    if (!isEnabled()) return;

    let cancelled = false;
    let overlay: { destroy(): void } | undefined;

    import("grid-auditor")
      .then(({ createGridOverlay }) => {
        if (cancelled) return;
        overlay = createGridOverlay();
      })
      // A dev tool: a failed chunk load (e.g. after a redeploy) should only warn.
      .catch((error: unknown) =>
        console.warn("grid-auditor failed to load", error),
      );

    return () => {
      cancelled = true;
      overlay?.destroy();
    };
  }, []);

  return null;
}
