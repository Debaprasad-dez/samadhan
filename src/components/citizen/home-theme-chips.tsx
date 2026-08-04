"use client";

import {
  useTheme,
  OFFERED_THEMES,
  THEME_LABELS,
  THEME_PICKER,
} from "@/components/providers/theme-provider";

/** Scrollable theme chip row in the home header (mockup). */
export function HomeThemeChips() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="themes" role="group" aria-label="Theme">
      {OFFERED_THEMES.map((id) => (
        <button
          key={id}
          className="tchip"
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
        >
          <span className="sw" aria-hidden>
            {THEME_PICKER[id].swatch.map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
          </span>
          {THEME_LABELS[id]}
        </button>
      ))}
    </div>
  );
}
