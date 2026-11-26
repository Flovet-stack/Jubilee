"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Select } from "@/components/ui/select";

const PAIRS = [
  { value: "current", label: "Plus Jakarta Sans (current)" },
  { value: "geist", label: "Geist (0037 trial)" },
  { value: "figtree-geist", label: "Figtree headings + Geist body" },
  { value: "vietnam-lexend", label: "Be Vietnam Pro headings + Lexend body" },
];

const STORAGE_KEY = "jubilee-font-pair";

function readStored(): string {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return PAIRS.some((pair) => pair.value === stored) && stored
      ? stored
      : "current";
  } catch {
    return "current";
  }
}

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function setPair(next: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage blocked: the choice just isn't remembered */
  }
  listeners.forEach((listener) => listener());
}

/** Dev-only font-pairing trial: swaps the fonts on the whole page. */
export function FontSwitcher({ fontVariables }: { fontVariables: string }) {
  const pair = useSyncExternalStore(subscribe, readStored, () => "current");

  useEffect(() => {
    const html = document.documentElement;
    const classes = fontVariables.split(" ");
    html.classList.add(...classes);
    if (pair === "current") delete html.dataset.fontPair;
    else html.dataset.fontPair = pair;
    return () => {
      html.classList.remove(...classes);
      delete html.dataset.fontPair;
    };
  }, [pair, fontVariables]);

  return (
    <Select
      aria-label="Font pairing"
      placeholder="Font pairing"
      items={PAIRS}
      value={pair}
      onValueChange={(value) => setPair(value ?? "current")}
      className="w-full sm:w-96"
    />
  );
}

const RADII = [
  { value: "ours", label: "Radius: ours (0022)" },
  { value: "pill", label: "Radius: pill (0037 trial)" },
];

/**
 * Dev-only radius trial (0037): pill corners on controls, this page only,
 * not saved. The attribute sits on <html> like the font trial, so portalled
 * menus and dialogs follow; it's removed when the page unmounts.
 */
export function RadiusSwitcher() {
  const [radius, setRadius] = useState("ours");

  useEffect(() => {
    const html = document.documentElement;
    if (radius === "pill") html.dataset.radiusTrial = "pill";
    else delete html.dataset.radiusTrial;
    return () => {
      delete html.dataset.radiusTrial;
    };
  }, [radius]);

  return (
    <Select
      aria-label="Corner radius"
      placeholder="Corner radius"
      items={RADII}
      value={radius}
      onValueChange={(value) => setRadius(value ?? "ours")}
      className="w-full sm:w-96"
    />
  );
}
