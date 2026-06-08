"use client";

import { Check } from "lucide-react";
import {
  useTheme,
  THEMES,
  THEME_LABELS,
} from "@/components/providers/theme-provider";
import { ModeControl } from "@/components/shared/mode-control";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

// Compact theme selector (design simplification): each theme is one same-sized
// tile — its name over a gradient of that theme's own colours. No swatch rows,
// no descriptions. `data-theme` makes every tile paint in its own palette.
export function ThemeGallery() {
  const { theme, setTheme } = useTheme();
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {THEMES.map((t) => {
          const active = t === theme;
          return (
            <button
              key={t}
              type="button"
              data-theme={t}
              onClick={() => setTheme(t)}
              aria-pressed={active}
              aria-label={THEME_LABELS[t]}
              className={cn(
                "relative flex h-16 items-end overflow-hidden rounded-xl p-2.5 text-left transition",
                active
                  ? "ring-2 ring-offset-2 ring-offset-[hsl(var(--surface))]"
                  : "hover:brightness-105",
              )}
              style={{
                background:
                  "linear-gradient(135deg, var(--g-primary) 0%, var(--g-accent) 52%, var(--g-gold) 100%)",
                ["--tw-ring-color" as string]: "var(--g-gold)",
              }}
            >
              <span
                className="font-display text-sm font-semibold leading-tight drop-shadow"
                style={{ color: "var(--g-btn-ink)" }}
              >
                {THEME_LABELS[t]}
              </span>
              {active && (
                <span
                  className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full"
                  style={{ background: "var(--g-btn-ink)", color: "var(--g-primary)" }}
                >
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
          {t("settings.mode")}
        </p>
        <ModeControl className="max-w-xs" />
      </div>
    </div>
  );
}
