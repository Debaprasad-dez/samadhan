"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme, type Mode } from "@/components/providers/theme-provider";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

// Segmented Light / Dark control with a sliding active indicator. Two modes
// only: light → Bharat Dawn, dark → Mughal Indigo.
const OPTIONS: { value: Mode; key: string; Icon: typeof Sun }[] = [
  { value: "light", key: "settings.modeLight", Icon: Sun },
  { value: "dark", key: "settings.modeDark", Icon: Moon },
];

export function ModeControl({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  const t = useT();
  return (
    <div
      role="radiogroup"
      aria-label="Colour mode"
      className={cn(
        "bg-surface-muted border-border flex rounded-full border p-1",
        className,
      )}
    >
      {OPTIONS.map(({ value, key, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-brand text-brand-foreground shadow-elev-1"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}
