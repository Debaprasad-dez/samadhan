"use client";

import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme, type Mode } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

// Segmented Light / Dark / System control with a sliding active indicator
// (design addendum §8.2). Used in the header switcher and the Settings gallery.
const OPTIONS: { value: Mode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "Auto", Icon: Laptop },
];

export function ModeControl({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Colour mode"
      className={cn(
        "bg-surface-muted border-border flex rounded-full border p-1",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
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
            {label}
          </button>
        );
      })}
    </div>
  );
}
