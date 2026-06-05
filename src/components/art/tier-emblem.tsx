import { cn } from "@/lib/utils";
import type { ReputationTier } from "@/types";

const ORDER: ReputationTier[] = [
  "Watcher",
  "Reporter",
  "Advocate",
  "Champion",
  "Civic Patron",
];

// Civic-reputation tier emblems (design §5.2 / §12). Ornateness escalates with
// tier: more rays, then gold, then a crown for Civic Patron. Token-coloured.
export function TierEmblem({
  tier,
  className,
}: {
  tier: ReputationTier;
  className?: string;
}) {
  const level = Math.max(0, ORDER.indexOf(tier));
  const points = 4 + level * 2; // 4 → 12
  const gold = level >= 3;
  const ring = gold ? "hsl(var(--motif-gold))" : "hsl(var(--brand))";

  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={`${tier} tier`}
      className={cn("shrink-0", className)}
    >
      {/* rays */}
      {[...Array(points)].map((_, i) => {
        const a = (i / points) * Math.PI * 2 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={24 + Math.cos(a) * 15}
            y1={24 + Math.sin(a) * 15}
            x2={24 + Math.cos(a) * 21}
            y2={24 + Math.sin(a) * 21}
            stroke={ring}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}
      <circle cx="24" cy="24" r="14" fill="hsl(var(--brand-soft))" stroke={ring} strokeWidth="2" />
      {/* inner lotus star */}
      {[...Array(6)].map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M24 24 q ${Math.cos(a) * 5} ${Math.sin(a) * 5} ${Math.cos(a) * 9} ${Math.sin(a) * 9}`}
            stroke={ring}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
      <circle cx="24" cy="24" r="3" fill={ring} />
      {/* crown for Civic Patron */}
      {level === 4 && (
        <path
          d="M16 9l4 5 4-6 4 6 4-5-1 9H17z"
          fill="hsl(var(--motif-gold))"
          stroke="hsl(var(--text) / 0.5)"
          strokeWidth="0.8"
        />
      )}
    </svg>
  );
}
