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

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  resolvedMode: ResolvedMode;
  themes: readonly ThemeName[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "samadhan-theme";
const MODE_KEY = "samadhan-mode";

const isTheme = (v: string | null): v is ThemeName =>
  !!v && (THEMES as readonly string[]).includes(v);

function systemMode(): ResolvedMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("bharat-dawn");
  const [mode, setModeState] = useState<Mode>("system");
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>("light");

  // Hydrate from storage (the no-flash script already set the attributes pre-paint).
  useEffect(() => {
    const t = localStorage.getItem(THEME_KEY);
    const m = localStorage.getItem(MODE_KEY);
    if (isTheme(t)) setThemeState(t);
    if (m === "light" || m === "dark" || m === "system") setModeState(m);
  }, []);

  const apply = useCallback((t: ThemeName, m: Mode) => {
    const rm: ResolvedMode = m === "system" ? systemMode() : m;
    const el = document.documentElement;
    el.setAttribute("data-theme", t);
    el.setAttribute("data-mode", rm);
    setResolvedMode(rm);
  }, []);

  useEffect(() => {
    apply(theme, mode);
  }, [theme, mode, apply]);

  // Follow system changes while in "system" mode.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply(theme, "system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, theme, apply]);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, mode, setMode, resolvedMode, themes: THEMES }}
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

/** The blocking no-flash script (design §2.2). Inject in <head> before render. */
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}')||'bharat-dawn';var m=localStorage.getItem('${MODE_KEY}')||'system';var rm=m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('data-mode',rm);}catch(e){}})();`;
