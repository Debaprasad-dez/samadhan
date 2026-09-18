"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LOCALES } from "@/lib/i18n";
import {
  useTheme,
  THEME_LABELS,
  THEME_PICKER,
} from "@/components/providers/theme-provider";

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

/** The languages this corporation's wards actually run on; the rest are one tap away. */
const LEAD = ["en", "bn", "trp", "hi"];
const LANG_KEY = "samadhan-lang";

/** Mockup order, which also wraps the chips two and two. */
const THEME_ORDER = ["bharat-dawn", "mughal-indigo", "civic-steel", "nilgiri-mist"] as const;

export function LoginBelow() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en");
  const [allLangs, setAllLangs] = useState(false);

  // Read after mount: the stored value is not in the server's HTML.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && LOCALES.some((l) => l.code === stored)) setLang(stored);
    } catch {
      /* private mode — English it is */
    }
  }, []);

  function choose(code: string) {
    setLang(code);
    try {
      localStorage.setItem(LANG_KEY, code);
    } catch {
      /* private mode — the choice just does not persist */
    }
  }

  const lead = LEAD.map((c) => LOCALES.find((l) => l.code === c)!).filter(Boolean);
  const shown = allLangs ? LOCALES : lead;
  const rest = LOCALES.length - lead.length;

  return (
    <div className="below fadeup" style={{ animationDelay: ".2s" }}>
      <Link href="/role-switch" className="demo">
        Just exploring? <b>Try a demo persona</b>
        <Arrow />
      </Link>

      <div className="langrow" role="group" aria-label="Language">
        {shown.map((l) => (
          <button
            key={l.code}
            aria-pressed={lang === l.code}
            onClick={() => choose(l.code)}
          >
            {l.native}
          </button>
        ))}
        {!allLangs && rest > 0 && (
          <button
            aria-pressed={false}
            aria-label={`Show ${rest} more languages`}
            onClick={() => setAllLangs(true)}
          >
            +{rest}
          </button>
        )}
      </div>

      <div className="themerow" role="group" aria-label="Theme">
        {THEME_ORDER.map((id) => (
          <button
            key={id}
            aria-pressed={theme === id}
            onClick={() => setTheme(id)}
          >
            <i style={{ background: THEME_PICKER[id].swatch[1] }} />
            {THEME_LABELS[id]}
          </button>
        ))}
      </div>

      <p className="foot">
        A public service of Agartala Municipal Corporation
        <br />
        Complaint data is published at ward level. Personal details are not.
      </p>
    </div>
  );
}
