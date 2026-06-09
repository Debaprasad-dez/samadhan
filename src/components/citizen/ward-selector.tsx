"use client";

import { useEffect, useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WARDS } from "@/lib/seed-data";
import { usePrefsStore } from "@/store/prefs";
import { cn } from "@/lib/utils";

// The home header ward pill — now a picker. The chosen ward persists and becomes
// the default ward in the complaint form (still editable there).
export function WardSelector({ initialWard }: { initialWard?: string }) {
  const pref = usePrefsStore((s) => s.wardCode);
  const setWardCode = usePrefsStore((s) => s.setWardCode);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Seed the preference from the user's home ward on first ever use.
  useEffect(() => {
    if (mounted && !pref && initialWard) setWardCode(initialWard);
  }, [mounted, pref, initialWard, setWardCode]);

  const code = (mounted ? pref : "") || initialWard || "";
  const name = WARDS.find((w) => w.code === code)?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
          style={{
            background: "color-mix(in srgb,var(--g-card) 72%,transparent)",
            backdropFilter: "blur(8px)",
            border: "1px solid color-mix(in srgb,var(--g-ink) 14%,transparent)",
            color: "var(--g-ink-soft)",
            boxShadow: "0 4px 14px -8px rgba(20,12,6,.45)",
          }}
        >
          <MapPin className="h-3 w-3" />
          {name ? `Ward ${code}` : "Pick ward"}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-72 w-56 overflow-y-auto p-1">
        <p className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide">
          Your ward
        </p>
        {WARDS.map((w) => {
          const active = w.code === code;
          return (
            <button
              key={w.code}
              type="button"
              onClick={() => {
                setWardCode(w.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                active
                  ? "bg-brand-soft text-brand"
                  : "hover:bg-accent-muted text-foreground",
              )}
            >
              <span className="truncate">
                {w.name}{" "}
                <span className="text-muted-foreground text-xs">· {w.code}</span>
              </span>
              {active && <Check className="h-3.5 w-3.5 flex-none" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
