import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WardStat } from "@/lib/ward-stats";

export function WardGrid({
  wards,
  selected,
}: {
  wards: WardStat[];
  selected?: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {wards.map((w) => {
        const empty = w.total === 0;
        const hue = Math.round((w.score / 100) * 145); // 0 red → 145 green
        return (
          <Link
            key={w.code}
            href={`/ward/${w.code}`}
            title={`${w.name} · ${w.total} cases · score ${w.score}`}
            style={{
              backgroundColor: empty
                ? "hsl(var(--surface-muted))"
                : `hsl(${hue} 55% 45%)`,
            }}
            className={cn(
              "flex aspect-square flex-col items-center justify-center rounded-md text-xs font-semibold transition-transform hover:scale-[1.04]",
              empty ? "text-muted-foreground" : "text-white",
              selected === w.code && "ring-foreground ring-2 ring-offset-2",
            )}
          >
            <span>{w.code}</span>
            <span className="text-[10px] opacity-90">{w.total}</span>
          </Link>
        );
      })}
    </div>
  );
}
