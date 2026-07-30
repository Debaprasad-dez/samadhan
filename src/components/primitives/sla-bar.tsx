"use client";

import { cn } from "@/lib/utils";

// SlaBar (design spec §2.1): a horizontal track with a fill and a LIMIT MARKER
// fixed at 78% of the track — leaving 22% of visual room for overrun, so a
// breached bar reads as *past the line*, not merely full.
//
// Invariant 1: a duration is never rendered without its limit. `limitDays` is
// required, and the caption always shows "<elapsed> of <limit>".

export type SlaBarState = "ok" | "warn" | "danger";

export interface SlaBarModel {
  fillPct: number; // 0..100 fill width
  state: SlaBarState;
  elapsedLabel: string;
  remainingLabel: string; // "2d 5h left" or "1d over"
  overrun: boolean;
}

function fmtDuration(hours: number): string {
  const h = Math.max(0, Math.round(hours));
  const d = Math.floor(h / 24);
  const r = h % 24;
  if (d > 0) return r > 0 ? `${d}d ${r}h` : `${d}d`;
  return `${r}h`;
}

/** Pure model for the bar (kept separate so it can be unit-tested). */
export function slaBarModel(elapsedHours: number, limitDays: number): SlaBarModel {
  const totalHours = limitDays * 24;
  const ratio = totalHours > 0 ? elapsedHours / totalHours : 1;
  // Fill reaches the 78% marker exactly at the limit; overrun fills to 100%.
  const fillPct = Math.min(100, Math.max(0, ratio * 78));
  const ratioPct = ratio * 100;
  const state: SlaBarState =
    ratioPct >= 100 ? "danger" : ratioPct >= 60 ? "warn" : "ok";
  const remainingHours = totalHours - elapsedHours;
  const overrun = remainingHours < 0;
  return {
    fillPct,
    state,
    elapsedLabel: fmtDuration(elapsedHours),
    remainingLabel: overrun
      ? `${fmtDuration(-remainingHours)} over`
      : `${fmtDuration(remainingHours)} left`,
    overrun,
  };
}

const FILL: Record<SlaBarState, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  danger: "bg-danger",
};

export function SlaBar({
  elapsedHours,
  limitDays,
  size = "md",
  animateOnMount = true,
  className,
}: {
  elapsedHours: number;
  /** REQUIRED — the invariant: a duration is never shown without its limit. */
  limitDays: number;
  size?: "sm" | "md";
  animateOnMount?: boolean;
  className?: string;
}) {
  const m = slaBarModel(elapsedHours, limitDays);
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "bg-surface-muted relative w-full overflow-hidden rounded-full",
          h,
        )}
      >
        {/* limit marker fixed at 78% of the track */}
        <span
          className="bg-border-strong absolute inset-y-0 z-10 w-px"
          style={{ left: "78%" }}
          aria-hidden
        />
        <div
          className={cn(
            "h-full rounded-full",
            FILL[m.state],
            animateOnMount && "transition-[width] duration-500 ease-out",
          )}
          style={{ width: `${m.fillPct}%` }}
        />
      </div>
      {size === "md" && (
        <div className="mt-1 flex justify-between text-xs font-semibold">
          <span className="text-muted-foreground">
            {m.elapsedLabel} of {limitDays}d
          </span>
          <span className={m.overrun ? "text-danger" : "text-muted-foreground"}>
            {m.remainingLabel}
          </span>
        </div>
      )}
    </div>
  );
}
