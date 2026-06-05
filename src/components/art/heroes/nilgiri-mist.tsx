import { cn } from "@/lib/utils";

// Western Ghats receding into mist with a backwater snake-boat gliding across
// and coconut fronds swaying (design §3.6). Token-coloured, reduced-motion safe.
export function HeroNilgiriMist({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="nmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--surface))" />
          <stop offset="100%" stopColor="hsl(var(--brand-soft))" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" rx="14" fill="url(#nmSky)" />

      {/* layered hills */}
      <path d="M0 120q70 -50 140 -20t260 10V200H0z" fill="hsl(var(--motif-1))" opacity="0.25" />
      <path d="M0 134q90 -36 180 -14t220 6V200H0z" fill="hsl(var(--motif-1))" opacity="0.4" />
      <path d="M0 150q110 -28 220 -6t180 2V200H0z" fill="hsl(var(--brand))" opacity="0.55" />

      {/* mist layers */}
      <g fill="hsl(var(--surface))">
        <ellipse cx="120" cy="120" rx="120" ry="10" opacity="0.6" style={{ animation: "mist 13s ease-in-out infinite" }} />
        <ellipse cx="280" cy="138" rx="140" ry="9" opacity="0.5" style={{ animation: "mist 17s ease-in-out infinite" }} />
      </g>

      {/* backwater */}
      <rect x="0" y="166" width="400" height="34" fill="hsl(var(--motif-1) / 0.22)" />
      <path d="M0 176h400M0 188h400" stroke="hsl(var(--brand))" strokeWidth="1" opacity="0.3" />

      {/* snake-boat (vallam) drifting */}
      <g style={{ animation: "drift-x 22s ease-in-out infinite" }}>
        <g transform="translate(180 178)">
          <path d="M-70 0q70 14 140 0q-14 8 -50 8h-40q-36 0 -50 -8z" fill="hsl(var(--text) / 0.7)" />
          <path d="M-70 0q-10 -6 -16 -16q10 4 18 10z" fill="hsl(var(--text) / 0.7)" />
          {[-30, -10, 10, 30].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="-12" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
          ))}
        </g>
      </g>

      {/* coconut fronds swaying */}
      {[18, 382].map((x, i) => (
        <g key={x} style={{ transformOrigin: `${x}px 20px`, animation: `sway ${8 + i}s ease-in-out infinite` }} stroke="hsl(var(--motif-1))" strokeWidth="2" fill="none" strokeLinecap="round">
          <line x1={x} y1="20" x2={x} y2="64" />
          <path d={`M${x} 24q${i ? -30 : 30} -4 ${i ? -44 : 44} 10`} />
          <path d={`M${x} 32q${i ? -26 : 26} 0 ${i ? -40 : 40} 16`} />
          <path d={`M${x} 22q${i ? -16 : 16} -12 ${i ? -30 : 30} -8`} />
        </g>
      ))}
    </svg>
  );
}
