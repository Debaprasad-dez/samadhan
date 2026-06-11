"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Two-axis theming (design §2.2): cultural theme × light/dark mode.
export const THEMES = [
  "bharat-dawn",
  "mithila-bloom",
  "warli-earth",
  "mughal-indigo",
  "coromandel-pattachitra",
  "nilgiri-mist",
] as const;
export type ThemeName = (typeof THEMES)[number];
export type Mode = "light" | "dark" | "system";
type ResolvedMode = "light" | "dark";

export const THEME_LABELS: Record<ThemeName, string> = {
  "bharat-dawn": "Bharat Dawn",
  "mithila-bloom": "Mithila Bloom",
  "warli-earth": "Warli Earth",
  "mughal-indigo": "Mughal Indigo",
  "coromandel-pattachitra": "Coromandel Pattachitra",
  "nilgiri-mist": "Nilgiri Mist",
};

// Heritage metadata for the theme picker (design addendum §8.2/§8.5) — the
// tradition each theme honours + a respectful one-line note on the art form.
export const THEME_META: Record<
  ThemeName,
  { tradition: string; blurb: string }
> = {
  "bharat-dawn": {
    tradition: "Banaras Ghats",
    blurb:
      "Sunrise over the Ganga — marigold garlands, temple gold and the daily renewal of civic hope.",
  },
  "mithila-bloom": {
    tradition: "Madhubani · Bihar",
    blurb:
      "Line-dense Mithila painting — fish, peacocks and lotus ponds in natural-dye colour.",
  },
  "warli-earth": {
    tradition: "Warli · Maharashtra",
    blurb:
      "White rice-paste figures on mud-ochre — minimal tribal geometry and the tarpa dance.",
  },
  "mughal-indigo": {
    tradition: "Mughal Miniature",
    blurb:
      "Indigo night, jali lattice and gold leaf — Indo-Islamic refinement and pietra dura.",
  },
  "coromandel-pattachitra": {
    tradition: "Pattachitra · Odisha",
    blurb:
      "Palm-leaf etching, bold outlines and ornate floral borders — temple narrative art.",
  },
  "nilgiri-mist": {
    tradition: "Kerala Mural",
    blurb:
      "Misty Western Ghats and backwaters — tea-estate calm with Theyyam vermillion.",
  },
};

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

const isTheme = (v: string | null): v is ThemeName =>
  !!v && (THEMES as readonly string[]).includes(v);

function systemMode(): ResolvedMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  role = "citizen",
  lockedTheme,
  forcedMode,
}: {
  children: ReactNode;
  /** Per-role storage namespace. */
  role?: string;
  /** When set, this theme is forced and the cultural picker is disabled
   *  (staff dashboards: a fixed professional theme + light/dark only). */
  lockedTheme?: string;
  /** When set, the light/dark mode is pinned and the toggle is disabled
   *  (logged-out pages: login always renders in light mode). */
  forcedMode?: ResolvedMode;
}) {
  const THEME_KEY = themeStorageKey(role);
  const MODE_KEY = modeStorageKey(role);

  const [theme, setThemeState] = useState<ThemeName>("bharat-dawn");
  const [mode, setModeState] = useState<Mode>("system");
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>(
    forcedMode ?? "light",
  );

  // The theme actually written to the DOM: the lock wins when present.
  const effectiveTheme = lockedTheme ?? theme;
  // The mode actually written to the DOM: the pin wins when present.
  const effectiveMode: Mode = forcedMode ?? mode;

  // Hydrate from storage (the no-flash script already set the attributes pre-paint).
  useEffect(() => {
    if (!lockedTheme) {
      const t = localStorage.getItem(THEME_KEY);
      if (isTheme(t)) setThemeState(t);
    }
    if (!forcedMode) {
      const m = localStorage.getItem(MODE_KEY);
      if (m === "light" || m === "dark" || m === "system") setModeState(m);
    }
  }, [THEME_KEY, MODE_KEY, lockedTheme, forcedMode]);

  const apply = useCallback((t: string, m: Mode) => {
    const rm: ResolvedMode = m === "system" ? systemMode() : m;
    const el = document.documentElement;
    el.setAttribute("data-theme", t);
    el.setAttribute("data-mode", rm);
    setResolvedMode(rm);
  }, []);

  useEffect(() => {
    apply(effectiveTheme, effectiveMode);
  }, [effectiveTheme, effectiveMode, apply]);

  // Follow system changes while in "system" mode (skip when the mode is pinned).
  useEffect(() => {
    if (forcedMode || mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply(effectiveTheme, "system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, effectiveTheme, apply, forcedMode]);

  const setTheme = useCallback(
    (t: ThemeName) => {
      if (lockedTheme) return; // staff theme is fixed — ignore picker changes
      setThemeState(t);
      localStorage.setItem(THEME_KEY, t);
    },
    [lockedTheme, THEME_KEY],
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
      value={{
        theme: effectiveTheme as ThemeName,
        setTheme,
        mode: effectiveMode,
        setMode,
        resolvedMode,
        themes: THEMES,
      }}
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
