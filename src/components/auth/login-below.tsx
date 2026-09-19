"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LOCALES } from "@/lib/i18n";

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

const Globe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
  </svg>
);

const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 9.5 12 15l5.5-5.5" />
  </svg>
);

const LANG_KEY = "samadhan-lang";

export function LoginBelow() {
  const [lang, setLang] = useState("en");

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

  return (
    <div className="below fadeup" style={{ animationDelay: ".2s" }}>
      <Link href="/role-switch" className="demo">
        Just exploring? <b>Try a demo persona</b>
        <Arrow />
      </Link>

      {/* All 24 languages in one control: a row of chips only ever showed four. */}
      <label className="langpick">
        <span className="ic" aria-hidden="true">
          <Globe />
        </span>
        <select
          aria-label="Language"
          value={lang}
          onChange={(e) => choose(e.target.value)}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native}
            </option>
          ))}
        </select>
        <span className="chev" aria-hidden="true">
          <Chevron />
        </span>
      </label>

      <p className="foot">Agartala Municipal Corporation · ward-level data only</p>
    </div>
  );
}
