"use client";

import Link from "next/link";
import { Palette, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  useTheme,
  THEMES,
  THEME_LABELS,
} from "@/components/providers/theme-provider";
import { ModeControl } from "./mode-control";
import { cn } from "@/lib/utils";

// Header quick-switcher (design addendum §8.3): a compact grid of the 6 heritage
// themes (each previewed in its own palette via data-theme) + the mode control +
// a link to the full gallery in Settings.
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Choose heritage theme">
          <Palette />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="mb-2 text-sm font-semibold">Heritage theme</p>
        <div className="grid grid-cols-3 gap-2">
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
                  "relative flex flex-col gap-1.5 rounded-lg border p-2 text-left transition",
                  active
                    ? "ring-brand ring-2 ring-offset-1 ring-offset-[hsl(var(--surface))]"
                    : "hover:brightness-105",
                )}
                style={{
                  borderColor: "var(--g-line)",
                  background: "var(--g-card)",
                }}
              >
                <span className="flex gap-1">
                  {["--g-primary", "--g-accent", "--g-gold"].map((v) => (
                    <span
                      key={v}
                      className="h-4 w-4 rounded-full"
                      style={{ background: `var(${v})` }}
                    />
                  ))}
                </span>
                <span
                  className="text-[10px] font-semibold leading-tight"
                  style={{ color: "var(--g-ink)" }}
                >
                  {THEME_LABELS[t].split(" ")[0]}
                </span>
                {active && (
                  <Check
                    className="absolute right-1 top-1 h-3 w-3"
                    style={{ color: "var(--g-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <ModeControl />
        </div>
        <Link
          href="/profile"
          className="text-brand mt-3 block text-center text-xs font-medium hover:underline"
        >
          More in Settings →
        </Link>
      </PopoverContent>
    </Popover>
  );
}
