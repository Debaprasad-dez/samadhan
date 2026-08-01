"use client";

import { Check } from "lucide-react";
import {
  useTheme,
  OFFERED_THEMES,
  THEME_LABELS,
  THEME_PICKER,
} from "@/components/providers/theme-provider";
import { ModeControl } from "@/components/shared/mode-control";
import { cn } from "@/lib/utils";

// Appearance control (mockup-minimal): a compact row of theme chips — each an
// overlapping three-swatch dot + name — plus the small light/dark toggle. Picking
// a chip applies + persists the theme; the toggle flips mode within it.
export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {OFFERED_THEMES.map((id) => {
        const active = theme === id;
        const { swatch } = THEME_PICKER[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            aria-label={`Theme: ${THEME_LABELS[id]}`}
            onClick={() => setTheme(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 text-xs font-medium transition-colors",
              active
                ? "border-brand ring-brand/40 text-foreground ring-1"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="flex" aria-hidden>
              {swatch.map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-4 w-4 rounded-full border border-black/10",
                    i > 0 && "-ml-1.5",
                  )}
                  style={{ background: c }}
                />
              ))}
            </span>
            {THEME_LABELS[id]}
            {active && <Check className="text-brand h-3 w-3" />}
          </button>
        );
      })}
      <ModeControl className="ml-auto" />
    </div>
  );
}

// Back-compat alias (the profile page previously imported ThemeGallery).
export const ThemeGallery = ThemePicker;
