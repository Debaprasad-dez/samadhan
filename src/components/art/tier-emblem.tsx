import { cn } from "@/lib/utils";
import type { ReputationTier } from "@/types";

const ORDER: ReputationTier[] = [
  "Watcher",
  "Reporter",
  "Advocate",
  "Champion",
  "Civic Patron",
];

/**
 * Civic-reputation tier emblems (design §5.2 / §12), escalating in ornateness:
 * more rays, a beaded ring, then gold, a faceted gemstone, and a crown for Civic
 * Patron. Gradient disc + token colours; recolours per theme.
 */
export function TierEmblem({
  tier,
  className,
}: {
  tier: ReputationTier;
  className?: string;
}) {
  const level = Math.max(0, ORDER.indexOf(tier));
  const points = 6 + level * 2; // 6 → 14
  const gold = level >= 3;
  const ring = gold ? "hsl(var(--motif-gold))" : "hsl(var(--brand))";
  const gem = ["hsl(var(--motif-2))", "hsl(var(--motif-3))", "hsl(var(--accent))", "hsl(var(--motif-1))", "hsl(var(--motif-gold))"][level];
  const uid = `te-${level}`;

  return (
    <svg viewBox="0 0 56 56" role="img" aria-label={`${tier} tier`} className={cn("shrink-0", className)}>
      <defs>
        <radialGradient id={`${uid}-disc`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--brand-soft))" />
          <stop offset="100%" stopColor="hsl(var(--brand) / 0.25)" />
        </radialGradient>
      </defs>

      {/* rays */}
      {[...Array(points)].map((_, i) => {
        const a = (i / points) * Math.PI * 2 - Math.PI / 2;
        const lng = i % 2 === 0;
        return (
          <line
            key={i}
            x1={28 + Math.cos(a) * 16}
            y1={28 + Math.sin(a) * 16}
            x2={28 + Math.cos(a) * (lng ? 25 : 21)}
            y2={28 + Math.sin(a) * (lng ? 25 : 21)}
            stroke={ring}
            strokeWidth={lng ? 2.2 : 1.4}
            strokeLinecap="round"
            opacity="0.9"
          />
        );
      })}

      {/* beaded ring */}
      {[...Array(16)].map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <circle key={i} cx={28 + Math.cos(a) * 16.5} cy={28 + Math.sin(a) * 16.5} r="1.5" fill={ring} opacity="0.85" />;
      })}

      <circle cx="28" cy="28" r="15" fill={`url(#${uid}-disc)`} stroke={ring} strokeWidth="2" />
      <circle cx="28" cy="28" r="11" fill="none" stroke={ring} strokeWidth="0.8" opacity="0.5" />

      {/* inner lotus petals */}
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M28 28 q ${Math.cos(a) * 4} ${Math.sin(a) * 4} ${Math.cos(a) * 9} ${Math.sin(a) * 9}`}
            stroke={ring}
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        );
      })}

      {/* central faceted gemstone */}
      <g transform="translate(28 28)">
        <path d="M0 -7l6 4-6 9-6-9z" fill={gem} stroke="hsl(var(--text) / 0.4)" strokeWidth="0.6" />
        <path d="M0 -7l6 4-6 3-6-3z" fill="hsl(0 0% 100% / 0.4)" />
        <path d="M-6 -3l6 3 6-3" fill="none" stroke="hsl(var(--text) / 0.3)" strokeWidth="0.5" />
      </g>

      {/* crown for Civic Patron */}
      {level === 4 && (
        <path d="M18 9l5 6 5-7 5 7 5-6-1 11H19z" fill="hsl(var(--motif-gold))" stroke="hsl(var(--text) / 0.5)" strokeWidth="0.8" strokeLinejoin="round" />
      )}
      {/* laurels for Champion */}
      {level === 3 && (
        <g stroke={ring} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M12 40q-4 -8 0 -16M44 40q4 -8 0 -16" />
        </g>
      )}
    </svg>
  );
}
