"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useTheme,
  THEMES,
  THEME_LABELS,
  THEME_META,
  type ThemeName,
} from "@/components/providers/theme-provider";
import { ModeControl } from "@/components/shared/mode-control";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

// A square, curved colour-hint box painted in a theme's own palette (data-theme
// resolves --g-* regardless of the active theme).
function ColorHint({
  theme,
  className,
}: {
  theme: ThemeName;
  className?: string;
}) {
  return (
    <span
      data-theme={theme}
      aria-hidden
      className={cn(
        "grid flex-none grid-cols-2 overflow-hidden rounded-xl ring-1 ring-black/10",
        className,
      )}
    >
      <i style={{ background: "var(--g-primary)" }} />
      <i style={{ background: "var(--g-accent)" }} />
      <i style={{ background: "var(--g-gold)" }} />
      <i style={{ background: "var(--g-bg)" }} />
    </span>
  );
}

export function ThemeGallery() {
  const { theme, setTheme } = useTheme();
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Theme — opens the picker modal */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
          {t("settings.theme")}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="border-border bg-surface hover:bg-accent-muted flex w-full items-center gap-3 rounded-xl border p-3 text-left transition"
            >
              <ColorHint theme={theme} className="h-11 w-11" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-base font-semibold">
                  {THEME_LABELS[theme]}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {THEME_META[theme].tradition}
                </span>
              </span>
              <ChevronRight className="text-muted-foreground h-4 w-4 flex-none" />
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                Choose your heritage
              </DialogTitle>
              <DialogDescription>
                Each theme dresses Samadhan in a living Indian art tradition.
              </DialogDescription>
            </DialogHeader>

            <div className="-mr-1 max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
              {THEMES.map((name) => {
                const active = name === theme;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setTheme(name);
                      setOpen(false);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition",
                      active
                        ? "border-brand bg-brand-soft/50 ring-brand ring-1"
                        : "border-border hover:bg-accent-muted",
                    )}
                  >
                    <ColorHint theme={name} className="h-12 w-12" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-semibold">
                        {THEME_LABELS[name]}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {THEME_META[name].tradition}
                      </span>
                    </span>
                    {active && (
                      <span className="bg-brand text-brand-foreground grid h-5 w-5 flex-none place-items-center rounded-full">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mode — full-width segmented control */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
          {t("settings.mode")}
        </p>
        <ModeControl className="w-full" />
      </div>
    </div>
  );
}
