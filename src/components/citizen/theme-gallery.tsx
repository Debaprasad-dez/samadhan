"use client";

import { Check, Info } from "lucide-react";
import { useState } from "react";
import {
  useTheme,
  THEMES,
  THEME_LABELS,
  THEME_META,
  type ThemeName,
} from "@/components/providers/theme-provider";
import { ModeControl } from "@/components/shared/mode-control";
import { cn } from "@/lib/utils";

// The full "Appearance" gallery (design addendum §8.2/§8.5): a mini cultural
// museum. Each card previews its own theme live (data-theme resolves the --g-*
// palette regardless of the active theme), names the tradition it honours, and
// reveals an educational note. Selected → gold frame + check.
function ThemeCard({
  name,
  active,
  onSelect,
}: {
  name: ThemeName;
  active: boolean;
  onSelect: () => void;
}) {
  const [info, setInfo] = useState(false);
  const meta = THEME_META[name];
  return (
    <div
      data-theme={name}
      className={cn(
        "relative overflow-hidden rounded-2xl border text-left transition",
        active ? "ring-2 ring-offset-2 ring-offset-[hsl(var(--surface))]" : "",
      )}
      style={{
        background: "var(--g-card)",
        borderColor: active ? "var(--g-gold)" : "var(--g-line)",
        ["--tw-ring-color" as string]: "var(--g-gold)",
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className="block w-full text-left"
      >
        {/* preview banner in this theme's gradient */}
        <div
          className="relative h-16"
          style={{ background: "var(--g-btn-grad)" }}
        >
          <div className="absolute inset-0 flex items-end gap-1 p-2">
            {["--g-bg", "--g-paper", "--g-ink", "--g-accent", "--g-gold"].map(
              (v) => (
                <span
                  key={v}
                  className="h-4 w-4 rounded-full ring-1 ring-white/40"
                  style={{ background: `var(${v})` }}
                />
              ),
            )}
          </div>
          {active && (
            <span
              className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full"
              style={{ background: "var(--g-gold)", color: "var(--g-ink)" }}
            >
              <Check className="h-3 w-3" />
            </span>
          )}
        </div>

        <div className="p-3">
          <p
            className="font-display text-base font-semibold leading-tight"
            style={{ color: "var(--g-ink)" }}
          >
            {THEME_LABELS[name]}
          </p>
          <p
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--g-primary)" }}
          >
            {meta.tradition}
          </p>
        </div>
      </button>

      {/* educational reveal */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setInfo((v) => !v)}
          className="flex items-center gap-1 text-[11px] font-medium"
          style={{ color: "var(--g-ink-soft)" }}
          aria-expanded={info}
        >
          <Info className="h-3 w-3" />
          {info ? "Hide" : "About this art"}
        </button>
        {info && (
          <p
            className="mt-1.5 text-[11px] leading-relaxed"
            style={{ color: "var(--g-ink-soft)" }}
          >
            {meta.blurb}
          </p>
        )}
      </div>
    </div>
  );
}

export function ThemeGallery() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {THEMES.map((t) => (
          <ThemeCard
            key={t}
            name={t}
            active={t === theme}
            onSelect={() => setTheme(t)}
          />
        ))}
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
          Mode
        </p>
        <ModeControl className="max-w-xs" />
      </div>
    </div>
  );
}
