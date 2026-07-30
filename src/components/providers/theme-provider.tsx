"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Two-axis theming (design spec): user-selected theme × light/dark mode.
export const THEMES = [
  "bharat-dawn",
  "civic-steel",
  "nilgiri-mist",
  "mughal-indigo",
  // Retained but NOT offered in the picker (dormant cultural palettes).
  "mithila-bloom",
  "warli-earth",
  "coromandel-pattachitra",
] as const;
export type ThemeName = (typeof THEMES)[number];
export type Mode = "light" | "dark" | "system";
type ResolvedMode = "light" | "dark";

export const THEME_LABELS: Record<ThemeName, string> = {
  "bharat-dawn": "Bharat Dawn",
  "civic-steel": "Civic Steel",
  "nilgiri-mist": "Nilgiri Mist",
  "mughal-indigo": "Mughal Indigo",
  "mithila-bloom": "Mithila Bloom",
  "warli-earth": "Warli Earth",
  "coromandel-pattachitra": "Coromandel Pattachitra",
};

// The four themes offered to end users (design spec §1.3). Each ships with both
// light and dark variants; the light/dark toggle flips the mode within a theme.
export const OFFERED_THEMES = [
  "bharat-dawn",
  "civic-steel",
  "nilgiri-mist",
  "mughal-indigo",
] as const;
export type OfferedTheme = (typeof OFFERED_THEMES)[number];

// Picker metadata: sub-label + a three-swatch strip (bg, brand, accent/ink).
export const THEME_PICKER: Record<
  OfferedTheme,
  { sub: string; swatch: [string, string, string] }
> = {
  "bharat-dawn": { sub: "Ghat sunrise · warm", swatch: ["#FBF6EC", "#B4541A", "#A9862F"] },
  "civic-steel": { sub: "Neutral · dense", swatch: ["#F5F6F8", "#1F5FD0", "#0D1117"] },
  "nilgiri-mist": { sub: "Cool · calm", swatch: ["#EFF2F0", "#136F63", "#7C7233"] },
  "mughal-indigo": { sub: "Jali night · brass", swatch: ["#0D1226", "#C9A24A", "#6FA8E8"] },
};

/** The default theme for a role: staff get Civic Steel, everyone else Bharat Dawn. */
export function defaultThemeForRole(role: string): ThemeName {
  return role === "officer" || role === "admin" ? "civic-steel" : "bharat-dawn";
}

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  resolvedMode: ResolvedMode;
  themes: readonly ThemeName[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Role-scoped storage keys so citizen / officer / admin theme+mode never bleed
// into one another (each role's preferences are independent).
export function themeStorageKey(role: string) {
  return `samadhan-theme-${role}`;
}
export function modeStorageKey(role: string) {
  return `samadhan-mode-${role}`;
}

const isOffered = (v: string | null): v is ThemeName =>
  !!v && (OFFERED_THEMES as readonly string[]).includes(v);

function systemMode(): ResolvedMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  role = "citizen",
  defaultTheme = "bharat-dawn",
  forcedMode,
}: {
  children: ReactNode;
  /** Per-role storage namespace. */
  role?: string;
  /** Fallback theme when nothing is stored yet (role default). */
  defaultTheme?: ThemeName;
  /** When set, the light/dark mode is pinned and the toggle is disabled
   *  (logged-out pages: login always renders in light mode). */
  forcedMode?: ResolvedMode;
}) {
  const THEME_KEY = themeStorageKey(role);
  const MODE_KEY = modeStorageKey(role);

  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [mode, setModeState] = useState<Mode>("light");
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>(
    forcedMode ?? "light",
  );

  const effectiveMode: Mode = forcedMode ?? mode;

  // Hydrate theme + mode from storage (the no-flash script already set the
  // attributes pre-paint, so this only syncs React state).
  useEffect(() => {
    const t = localStorage.getItem(THEME_KEY);
    if (isOffered(t)) setThemeState(t);
    if (!forcedMode) {
      const m = localStorage.getItem(MODE_KEY);
      if (m === "light" || m === "dark" || m === "system") setModeState(m);
    }
  }, [THEME_KEY, MODE_KEY, forcedMode]);

  const apply = useCallback((t: ThemeName, m: Mode) => {
    const rm: ResolvedMode = m === "system" ? systemMode() : m;
    const el = document.documentElement;
    el.setAttribute("data-theme", t);
    el.setAttribute("data-mode", rm);
    setResolvedMode(rm);
  }, []);

  useEffect(() => {
    apply(theme, effectiveMode);
  }, [theme, effectiveMode, apply]);

  // Follow system changes while in "system" mode (skip when the mode is pinned).
  useEffect(() => {
    if (forcedMode || mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply(theme, "system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, theme, apply, forcedMode]);

  const setTheme = useCallback(
    (t: ThemeName) => {
      setThemeState(t);
      localStorage.setItem(THEME_KEY, t);
    },
    [THEME_KEY],
  );

  const setMode = useCallback(
    (m: Mode) => {
      if (forcedMode) return; // mode pinned (logged out) — ignore toggle
      setModeState(m);
      localStorage.setItem(MODE_KEY, m);
    },
    [MODE_KEY, forcedMode],
  );

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, mode: effectiveMode, setMode, resolvedMode, themes: OFFERED_THEMES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// The blocking no-flash script lives in src/lib/theme-noflash.ts (a server-safe
// module RootLayout can call). Its storage keys must match the helpers above.
