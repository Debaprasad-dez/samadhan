import { ArrowUp, ArrowDown, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// MetricCard (design spec §2.4): uppercase tracked label, a large tabular value
// with an optional unit, and an optional delta line with a direction icon +
// colour. A percentage must carry its denominator — pass `n` (e.g. "of 42") so a
// rate is never shown without the base it was computed from.

export interface MetricDelta {
  /** e.g. "+12%", "-3" */
  value: string;
  direction: "up" | "down" | "flat";
  /** Whether the move is good (green) or bad (red); flat is neutral. */
  good?: boolean;
}

const DELTA_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;

export function MetricCard({
  label,
  value,
  unit,
  n,
  icon: Icon,
  iconClass,
  iconBgClass,
  delta,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  /** Denominator for a rate/percentage, rendered as "of {n}". Required whenever
   *  `value` is a percentage — a rate without its base is not shippable. */
  n?: string | number;
  icon?: LucideIcon;
  iconClass?: string;
  iconBgClass?: string;
  delta?: MetricDelta;
  className?: string;
}) {
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-start gap-3 p-4">
        {Icon && (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
              iconBgClass ?? "bg-brand-soft",
            )}
          >
            <Icon className={cn("h-5 w-5", iconClass ?? "text-brand")} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="font-display mt-0.5 text-2xl font-bold tabular-nums">
            {value}
            {unit && (
              <small className="text-muted-foreground ml-1 text-sm font-semibold">
                {unit}
              </small>
            )}
          </p>
          {n !== undefined && (
            <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
              of {n}
            </p>
          )}
          {delta && DeltaIcon && (
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                delta.direction === "flat"
                  ? "text-muted-foreground"
                  : delta.good
                    ? "text-success"
                    : "text-danger",
              )}
            >
              <DeltaIcon className="h-3 w-3" aria-hidden />
              {delta.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
