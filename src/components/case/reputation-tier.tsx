import { tierForScore } from "@/lib/reputation";
import { cn } from "@/lib/utils";

export function TierChip({
  reputation,
  showScore = true,
  className,
}: {
  reputation: number;
  showScore?: boolean;
  className?: string;
}) {
  const tier = tierForScore(reputation);
  const gold = tier === "Civic Patron";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        gold
          ? "bg-warning-soft text-warning ring-warning/40 ring-1"
          : "bg-surface-muted text-foreground",
        className,
      )}
    >
      {tier}
      {showScore && ` · ${reputation}`}
    </span>
  );
}
