import { cn } from "@/lib/utils";

// A jali screen under a cusped arch with gold arabesque corners (design §3.4).
// The gold shimmers (slow opacity sweep). Token-coloured, reduced-motion safe.
export function HeroMughalIndigo({ className }: { className?: string }) {
  const cols = 10;
  const rows = 4;
  return (
    <svg
      viewBox="0 0 400 200"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="miSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--surface))" />
          <stop offset="100%" stopColor="hsl(var(--bg))" />
        </linearGradient>
        <clipPath id="miArch">
          <path d="M120 170V96a80 80 0 0 1 160 0v74z" />
        </clipPath>
      </defs>
      <rect width="400" height="200" rx="14" fill="url(#miSky)" />

      {/* jali lattice inside the arch */}
      <g clipPath="url(#miArch)">
        <rect x="120" y="20" width="160" height="150" fill="hsl(var(--brand) / 0.12)" />
        {[...Array(rows)].map((_, r) =>
          [...Array(cols)].map((_, c) => {
            const x = 124 + c * 16;
            const y = 40 + r * 30;
            return (
              <g key={`${r}-${c}`} stroke="hsl(var(--motif-gold))" strokeWidth="1" fill="none" opacity="0.5">
                <path d={`M${x} ${y - 7}l7 7-7 7-7-7z`} />
                <path d={`M${x - 7} ${y}h14M${x} ${y - 7}v14`} opacity="0.5" />
              </g>
            );
          }),
        )}
      </g>

      {/* cusped arch outline */}
      <path d="M120 170V96a80 80 0 0 1 160 0v74" fill="none" stroke="hsl(var(--motif-gold))" strokeWidth="2.5" />
      <path d="M196 24q4 -10 8 0q-4 6 -8 0z" fill="hsl(var(--motif-gold))" />

      {/* gold arabesque corners (shimmer) */}
      <g
        stroke="hsl(var(--motif-gold))"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        style={{ animation: "gold-sweep 8s ease-in-out infinite" }}
      >
        <path d="M24 40q24 -16 44 -4q-18 -2 -24 12q-2 -14 -20 -8z" />
        <path d="M376 40q-24 -16 -44 -4q18 -2 24 12q2 -14 20 -8z" />
        <path d="M24 170q20 -8 22 -28q6 16 22 14" />
        <path d="M376 170q-20 -8 -22 -28q-6 16 -22 14" />
      </g>
    </svg>
  );
}
