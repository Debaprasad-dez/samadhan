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
        // Sequential SINGLE-HUE scale (spec §3): one hue (teal), pale → deep as
        // the resolution score rises. No red↔green diverging rainbow.
        const t = w.score / 100;
        const light = 92 - t * 55; // 92% pale → 37% deep
        const sat = 22 + t * 48;
        const lightText = !empty && light < 58;
        return (
          <Link
            key={w.code}
            href={`/ward/${w.code}`}
            title={`${w.name} · ${w.total} cases · score ${w.score}`}
            style={{
              backgroundColor: empty
                ? "hsl(var(--surface-muted))"
                : `hsl(162 ${sat}% ${light}%)`,
            }}
            className={cn(
              "flex aspect-square flex-col items-center justify-center rounded-md text-xs font-semibold transition-transform hover:scale-[1.04]",
              empty
                ? "text-muted-foreground"
                : lightText
                  ? "text-white"
                  : "text-foreground",
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
