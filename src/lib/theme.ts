/**
 * Light or dark, chosen in the account menu. With no choice saved, the
 * system setting wins (0007). The choice lives in this browser only
 * (localStorage), so nothing about it leaves the device.
 */
export type Theme = "light" | "dark";

export const THEME_KEY = "jubilee-theme";

export function parseTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

/**
 * Runs in <head> before the first paint, so a saved theme never flashes the
 * other one. Kept tiny and dependency-free; storage may throw (private mode).
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

/** Whether the page shows dark right now (saved choice, else the system). */
export function isDarkNow(): boolean {
  const saved = parseTheme(document.documentElement.dataset.theme);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function saveTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode: the choice lasts for this page only.
  }
}
