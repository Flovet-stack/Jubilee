"use client";

import type {
  LegacyAnimationControls,
  ResolvedValues,
  VisualElement,
} from "motion";
import type { ForwardedRef } from "react";
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { getDefaultValueType, setTarget, visualElementStore } from "motion";

import { useControlHover } from "./use-control-hover";

/**
 * Shared by every animated icon (decision 0009). icons-animated ships this
 * helper inside each icon file; we keep one copy here so a fix lands once.
 * Vendoring edits, same as AniKansou:
 * 1. one shared module instead of 34 copies;
 * 2. the icon plays when its surrounding button or link is hovered with a
 *    mouse or pen, or focused from the keyboard (`useControlHover`);
 * 3. `isControlled` is read when an event fires, not during render.
 * Reduced motion: animations are skipped and values reset to rest.
 */

export type IconAnimationHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type RawHandle = {
  startAnimation: () => unknown;
  stopAnimation: () => unknown;
};

type IconAccessibilitySnapshot = {
  visual: VisualElement;
  values: ResolvedValues;
  attributes: Record<string, string>;
};

const REST_DEFAULTS: Record<string, number> = {
  opacity: 1,
  pathLength: 1,
  pathSpacing: 1,
  pathOffset: 0,
  strokeDashoffset: 0,
};

export function useIconAccessibility(
  ref: ForwardedRef<IconAnimationHandle>,
  createHandle: () => RawHandle,
  controllers: LegacyAnimationControls[],
) {
  const rawHandle = createHandle();
  const raw = useRef(rawHandle);
  useEffect(() => {
    raw.current = rawHandle;
  }, [rawHandle]);
  const controls = useRef(controllers);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const preference = useRef(false);
  const mounted = useRef(true);
  const [reduced, setReduced] = useState(false);
  const api = useMemo<IconAnimationHandle>(
    () => ({
      startAnimation() {
        if (
          mounted.current &&
          !preference.current &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          void raw.current.startAnimation();
        }
      },
      stopAnimation() {
        if (mounted.current) void raw.current.stopAnimation();
      },
    }),
    [],
  );
  useImperativeHandle(ref, () => api, [api]);
  const hasControl = useControlHover(
    rootRef,
    api.startAnimation,
    api.stopAnimation,
  );

  useEffect(() => {
    mounted.current = true;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const snapshots: IconAccessibilitySnapshot[] = [];
    rootRef.current
      ?.querySelectorAll<SVGElement>("svg, svg *")
      .forEach((element) => {
        const visual = visualElementStore.get(element);
        if (visual)
          snapshots.push({
            visual,
            values: { ...visual.latestValues },
            attributes: Object.fromEntries(
              [...element.attributes].map((attribute) => [
                attribute.name,
                attribute.value,
              ]),
            ),
          });
      });
    const restore = () => {
      for (const { visual, values, attributes } of snapshots) {
        visual.values.forEach((value) => value.stop());
        const props = visual.getProps() as unknown as {
          [key: string]: unknown;
          style?: Record<string, unknown>;
        };
        const reset: Record<string, string | number> = {};
        visual.values.forEach((_motionValue, key) => {
          const attribute = key.replace(
            /[A-Z]/g,
            (letter) => "-" + letter.toLowerCase(),
          );
          const value =
            values[key] ??
            props.style?.[key] ??
            props[key] ??
            getDefaultValueType(key)?.default ??
            REST_DEFAULTS[key] ??
            attributes[attribute];
          if (typeof value === "number" || typeof value === "string")
            reset[key] = value;
        });
        setTarget(visual, reset);
        visual.render();
      }
    };
    const activeControls = controls.current;
    const originals = activeControls.map((control) => {
      const original = control.start;
      control.start = (definition, transition) => {
        if (!mounted.current) return new Promise<never>(() => {});
        if (preference.current) {
          control.set(definition);
          return Promise.resolve();
        }
        try {
          return original(definition, transition);
        } catch {
          // Motion's controls unmount before our cleanup runs; a blur fired
          // while the focused control is being removed lands here. Nothing
          // is left to animate, so settle quietly.
          return Promise.resolve();
        }
      };
      return original;
    });
    const change = () => {
      preference.current = media.matches;
      setReduced(media.matches);
      if (media.matches) {
        void raw.current.stopAnimation();
        activeControls.forEach((control) => control.stop());
        restore();
      }
    };
    change();
    media.addEventListener("change", change);
    return () => {
      mounted.current = false;
      media.removeEventListener("change", change);
      activeControls.forEach((control, index) => {
        control.stop();
        const original = originals[index];
        if (original) control.start = original;
      });
    };
  }, []);

  return {
    ...api,
    rootRef,
    /** Driven by a ref or by the surrounding control: own hover stands down. */
    isControlled: () => ref != null || hasControl.current,
    reduced,
    reduceDefinition<T>(definition: T): T {
      if (
        reduced &&
        definition &&
        typeof definition === "object" &&
        !Array.isArray(definition) &&
        !("start" in definition)
      ) {
        return {
          ...definition,
          transition: { type: false, duration: 0, delay: 0, repeat: 0 },
        } as T;
      }
      return definition;
    },
  };
}
