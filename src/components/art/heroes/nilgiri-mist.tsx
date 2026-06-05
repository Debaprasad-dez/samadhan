import { cn } from "@/lib/utils";

/**
 * The Western Ghats receding into mist (design §3.6): layered tea-terraced hills
 * with atmospheric perspective, drifting mist bands, a Kerala backwater where a
 * long snake-boat (vallam) glides with its rowers, swaying coconut palms and a
 * watching heron. Cool, serene, depth-rich. Colour from theme tokens.
 */
export function HeroNilgiriMist({ className }: { className?: string }) {
  const G = "hsl(var(--motif-1))"; // tea green
  const V = "hsl(var(--motif-2))"; // vermillion accent
  const INK = "hsl(var(--text) / 0.7)";

  return (
    <svg viewBox="0 0 800 380" role="presentation" aria-hidden className={cn("h-auto w-full", className)}>
      <defs>
        <linearGradient id="nm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--surface))" />
          <stop offset="100%" stopColor="hsl(var(--brand-soft))" />
        </linearGradient>
        <linearGradient id="nm-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand-soft))" />
          <stop offset="100%" stopColor="hsl(var(--motif-1) / 0.3)" />
        </linearGradient>
        <radialGradient id="nm-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--motif-gold) / 0.7)" />
          <stop offset="100%" stopColor="hsl(var(--motif-gold) / 0)" />
        </radialGradient>
        <filter id="nm-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <clipPath id="nm-clip"><rect width="800" height="380" rx="16" /></clipPath>
      </defs>

      <g clipPath="url(#nm-clip)">
        <rect width="800" height="380" fill="url(#nm-sky)" />
        <circle cx="180" cy="96" r="80" fill="url(#nm-sun)" filter="url(#nm-blur)" />
        <circle cx="180" cy="96" r="26" fill="hsl(var(--motif-gold) / 0.55)" />

        {/* layered hills (back to front, atmospheric) */}
        <path d="M0 150q120 -56 240 -22t260 6 300 -20V250H0z" fill={G} opacity="0.18" />
        <path d="M0 176q150 -44 300 -14t260 10 240 -8V260H0z" fill={G} opacity="0.32" />
        <path d="M0 206q160 -40 320 -8t220 14 260 -10V270H0z" fill={G} opacity="0.5" />
        <path d="M0 236q180 -34 360 -4t160 12 280 -8V280H0z" fill="hsl(var(--brand) / 0.55)" />

        {/* tea terraces on the front hill */}
        <g stroke="hsl(var(--surface) / 0.45)" strokeWidth="1.4" fill="none">
          {[226, 236, 246, 256].map((y, i) => (
            <path key={y} d={`M${480 + i * 6} ${y}q90 -10 180 -2`} />
          ))}
        </g>

        {/* mist bands */}
        <g fill="hsl(var(--surface))">
          <ellipse cx="140" cy="166" rx="160" ry="12" opacity="0.6" filter="url(#nm-blur)" style={{ animation: "mist 15s ease-in-out infinite" }} />
          <ellipse cx="520" cy="196" rx="200" ry="11" opacity="0.55" filter="url(#nm-blur)" style={{ animation: "mist 19s ease-in-out infinite" }} />
          <ellipse cx="300" cy="220" rx="180" ry="9" opacity="0.4" filter="url(#nm-blur)" style={{ animation: "mist 23s ease-in-out infinite" }} />
        </g>

        {/* backwater */}
        <rect x="0" y="270" width="800" height="110" fill="url(#nm-water)" />
        <g stroke="hsl(var(--surface) / 0.4)" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M40 300q40 -6 80 0t80 0M520 320q40 -6 80 0t80 0M120 348q50 -6 100 0t100 0" opacity="0.5" />
        </g>
        {/* sun reflection */}
        <rect x="164" y="270" width="32" height="100" fill="url(#nm-sun)" opacity="0.5" />

        {/* snake-boat (vallam) with rowers, gliding */}
        <g style={{ animation: "drift-x 26s ease-in-out infinite" }}>
          <g transform="translate(420 318)">
            <path d="M-150 0q150 26 300 0q-150 -8 -150 -8q-150 0 -150 8z" fill="hsl(var(--text) / 0.78)" />
            <path d="M150 0q26 -4 40 -34q-6 18 -26 30z" fill="hsl(var(--text) / 0.78)" />
            <path d="M-150 0q-10 -2 -16 -12q10 2 18 8z" fill="hsl(var(--text) / 0.78)" />
            {[...Array(11)].map((_, i) => {
              const x = -120 + i * 24;
              return (
                <g key={i}>
                  <circle cx={x} cy="-9" r="3.5" fill={V} />
                  <line x1={x} y1="-6" x2={x + 8} y2="6" stroke="hsl(var(--text) / 0.6)" strokeWidth="2" strokeLinecap="round" />
                </g>
              );
            })}
          </g>
        </g>

        {/* heron in the shallows */}
        <g transform="translate(700 318)" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M0 0v-22q0 -10 10 -14" />
          <path d="M10 -36l9 -3M10 -34l-2 -8" stroke={V} />
          <path d="M0 -20q-12 4 -16 12" fill="hsl(var(--surface) / 0.8)" />
          <line x1="-2" y1="0" x2="-2" y2="10" />
          <line x1="2" y1="0" x2="2" y2="10" />
        </g>

        {/* coconut palms */}
        {[
          { x: 40, dir: 1 },
          { x: 760, dir: -1 },
        ].map((p) => (
          <g key={p.x} style={{ transformOrigin: `${p.x}px 40px`, animation: `sway ${8 + p.x / 200}s ease-in-out infinite` }}>
            <path d={`M${p.x} 30q${p.dir * 8} 90 ${p.dir * 2} 240`} fill="none" stroke="hsl(var(--text) / 0.55)" strokeWidth="5" strokeLinecap="round" />
            {[-1, -0.5, 0.2, 0.9].map((k, i) => (
              <path key={i} d={`M${p.x} 34q${p.dir * (50 * k)} ${-10 + i * 12} ${p.dir * (74 * k)} ${6 + i * 14}`} fill="none" stroke={G} strokeWidth="3" strokeLinecap="round" />
            ))}
            <circle cx={p.x + p.dir * 4} cy="40" r="4" fill="hsl(var(--text) / 0.5)" />
          </g>
        ))}
      </g>
      <rect width="800" height="380" rx="16" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
    </svg>
  );
}
