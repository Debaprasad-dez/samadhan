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

// Appearance control (design spec §1.3): a 2×2 grid of theme cards — each with a
// three-swatch strip, name and sub-label — plus the light/dark segmented
// control. Picking a card applies + persists the theme; the mode control flips
// light/dark within it. (A 2×2 grid, not a cycling toggle: with four options a
// toggle can take three taps to reach a known state.)
export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {OFFERED_THEMES.map((id) => {
          const active = theme === id;
          const { sub, swatch } = THEME_PICKER[id];
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              aria-label={`Theme: ${THEME_LABELS[id]}`}
              onClick={() => setTheme(id)}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-brand ring-brand/40 ring-2"
                  : "border-border hover:border-border-strong",
              )}
            >
              <span className="flex gap-1.5" aria-hidden>
                {swatch.map((c, i) => (
                  <span
                    key={i}
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </span>
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold">{THEME_LABELS[id]}</span>
                {active && <Check className="text-brand h-4 w-4" />}
              </span>
              <span className="text-muted-foreground text-xs">{sub}</span>
            </button>
          );
        })}
      </div>
      <ModeControl className="max-w-xs" />
    </div>
  );
}

// Back-compat alias (the profile page previously imported ThemeGallery).
export const ThemeGallery = ThemePicker;
