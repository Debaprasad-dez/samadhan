import { BADGES } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import { BadgeMedallion } from "@/components/art/badge-medallion";

export function BadgeGrid({ earned }: { earned: string[] }) {
  const set = new Set(earned);
  return (
    <div className="grid grid-cols-3 gap-3">
      {BADGES.map((b) => {
        const has = set.has(b.id);
        return (
          <div
            key={b.id}
            title={b.description}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors",
              has
                ? "bg-brand-soft border-brand/30"
                : "bg-surface-muted opacity-70",
            )}
          >
            <BadgeMedallion iconKey={b.iconKey} earned={has} className="w-14" />
            <span className="text-xs font-medium leading-tight">{b.name}</span>
          </div>
        );
      })}
    </div>
  );
}
