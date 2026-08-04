"use client";

import {
  useTheme,
  OFFERED_THEMES,
  THEME_LABELS,
  THEME_PICKER,
} from "@/components/providers/theme-provider";

// Appearance picker on the profile: a 2×2 grid of theme cards — swatch strip,
// name, sub-label (mockup).
const SUB: Record<string, string> = {
  "bharat-dawn": "Ghat sunrise",
  "mughal-indigo": "Jali night",
  "civic-steel": "Neutral, dense",
  "nilgiri-mist": "Cool, calm",
};

export function ThemeCards() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="tcards" role="group" aria-label="Theme">
      {OFFERED_THEMES.map((id) => (
        <button
          key={id}
          className="tcard"
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
        >
          <span className="sw" aria-hidden>
            {THEME_PICKER[id].swatch.map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
          </span>
          <span className="n">{THEME_LABELS[id]}</span>
          <span className="s2">{SUB[id]}</span>
        </button>
      ))}
    </div>
  );
}
