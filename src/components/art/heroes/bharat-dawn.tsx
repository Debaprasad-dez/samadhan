import { cn } from "@/lib/utils";

/**
 * Sunrise over the Varanasi ghats (design §3.1). A layered, atmospheric scene:
 * a gradient dawn sky, a glowing sun with slowly rotating rays, receding temple
 * shikharas, stepped ghats, a shimmering river with the sun's reflection, a boat
 * gliding across, floating diyas, and a flock of birds. Colour from theme tokens;
 * reduced-motion freezes it to a designed static frame.
 */
export function HeroBharatDawn({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 380"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--surface))" />
          <stop offset="46%" stopColor="hsl(var(--brand-soft))" />
          <stop offset="100%" stopColor="hsl(var(--motif-gold) / 0.28)" />
        </linearGradient>
        <radialGradient id="bd-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--motif-gold) / 0.85)" />
          <stop offset="55%" stopColor="hsl(var(--brand) / 0.35)" />
          <stop offset="100%" stopColor="hsl(var(--brand) / 0)" />
        </radialGradient>
        <radialGradient id="bd-sun" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--motif-gold))" />
          <stop offset="100%" stopColor="hsl(var(--brand))" />
        </radialGradient>
        <linearGradient id="bd-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent) / 0.16)" />
          <stop offset="100%" stopColor="hsl(var(--brand) / 0.3)" />
        </linearGradient>
        <linearGradient id="bd-reflect" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--motif-gold) / 0.85)" />
          <stop offset="100%" stopColor="hsl(var(--motif-gold) / 0)" />
        </linearGradient>
        <filter id="bd-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <clipPath id="bd-clip">
          <rect width="800" height="380" rx="16" />
        </clipPath>
      </defs>

      <g clipPath="url(#bd-clip)">
        <rect width="800" height="380" fill="url(#bd-sky)" />

        {/* sun glow + disc + rotating rays */}
        <circle cx="560" cy="150" r="135" fill="url(#bd-glow)" filter="url(#bd-soft)" />
        <g style={{ transformOrigin: "560px 150px", animation: "spin-slow 60s linear infinite" }}>
          {[...Array(24)].map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const long = i % 2 === 0;
            return (
              <line
                key={i}
                x1={560 + Math.cos(a) * 70}
                y1={150 + Math.sin(a) * 70}
                x2={560 + Math.cos(a) * (long ? 104 : 88)}
                y2={150 + Math.sin(a) * (long ? 104 : 88)}
                stroke="hsl(var(--motif-gold))"
                strokeWidth={long ? 3 : 2}
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })}
        </g>
        <circle cx="560" cy="150" r="58" fill="url(#bd-sun)" />
        <circle cx="560" cy="150" r="58" fill="none" stroke="hsl(var(--motif-gold))" strokeWidth="1.5" opacity="0.6" />

        {/* distant skyline (atmospheric) */}
        <g fill="hsl(var(--text) / 0.16)">
          {[80, 150, 250, 700].map((x, i) => (
            <path key={x} d={`M${x} 250v-${30 + i * 6}q0 -18 14 -18t14 18v${30 + i * 6}z`} />
          ))}
        </g>

        {/* mid-ground temple cluster (shikharas + domes) */}
        <g>
          <path
            d="M300 252V150c0-26 36-26 36 0v102z"
            fill="hsl(var(--surface-muted))"
            stroke="hsl(var(--border-strong))"
            strokeWidth="2"
          />
          <path d="M318 124c10 10 10 18 0 26-10-8-10-16 0-26z" fill="hsl(var(--motif-gold))" />
          <line x1="318" y1="118" x2="318" y2="150" stroke="hsl(var(--border-strong))" strokeWidth="2" />
          <rect x="360" y="196" width="70" height="56" fill="hsl(var(--surface))" stroke="hsl(var(--border-strong))" strokeWidth="2" />
          <path d="M360 196q35 -40 70 0z" fill="hsl(var(--surface-muted))" stroke="hsl(var(--border-strong))" strokeWidth="2" />
          <path d="M392 150c8 6 8 12 0 18-8-6-8-12 0-18z" fill="hsl(var(--motif-gold))" />
          <line x1="395" y1="152" x2="395" y2="174" stroke="hsl(var(--border-strong))" strokeWidth="2" />
          {[372, 388, 404, 418].map((x) => (
            <rect key={x} x={x} y="214" width="8" height="38" fill="hsl(var(--brand) / 0.18)" />
          ))}
          <path d="M452 252v-70q0 -16 13 -16t13 16v70z" fill="hsl(var(--surface-muted))" stroke="hsl(var(--border-strong))" strokeWidth="2" />
          <circle cx="465" cy="160" r="5" fill="hsl(var(--motif-gold))" />
        </g>

        {/* ghat steps */}
        <g fill="hsl(var(--surface-muted))" stroke="hsl(var(--border) / 0.6)" strokeWidth="1">
          <rect x="0" y="250" width="800" height="9" />
          <rect x="0" y="259" width="800" height="9" opacity="0.9" />
          <rect x="0" y="268" width="800" height="11" opacity="0.8" />
        </g>

        {/* river */}
        <rect x="0" y="279" width="800" height="101" fill="url(#bd-water)" />
        <rect x="540" y="279" width="40" height="101" fill="url(#bd-reflect)" opacity="0.6" style={{ animation: "gold-sweep 5s ease-in-out infinite" }} />
        <g stroke="hsl(var(--surface) / 0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M40 300q30 -6 60 0t60 0M520 312q40 -6 80 0t80 0M120 336q40 -6 80 0t80 0" opacity="0.5" />
          <path d="M300 350q50 -6 100 0t100 0" opacity="0.4" />
        </g>

        {/* gliding boat */}
        <g style={{ animation: "drift-x 30s ease-in-out infinite" }}>
          <g transform="translate(250 322)">
            <path d="M-58 0q58 16 116 0q-10 12 -34 12h-48q-24 0 -34 -12z" fill="hsl(var(--text) / 0.72)" />
            <path d="M-58 0q-12 -4 -20 -14q12 2 22 8z" fill="hsl(var(--text) / 0.72)" />
            <line x1="14" y1="-2" x2="38" y2="-20" stroke="hsl(var(--text) / 0.6)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="6" cy="-16" r="5" fill="hsl(var(--text) / 0.8)" />
            <path d="M6 -12l-6 12h12z" fill="hsl(var(--text) / 0.8)" />
          </g>
        </g>

        {/* floating diyas */}
        {[
          { x: 470, y: 344, d: 0 },
          { x: 600, y: 356, d: 1.2 },
          { x: 690, y: 338, d: 0.5 },
        ].map((p) => (
          <g key={p.x} transform={`translate(${p.x} ${p.y})`} style={{ animation: `bob ${5 + p.d}s ease-in-out infinite` }}>
            <ellipse rx="11" ry="3.5" fill="hsl(var(--brand))" />
            <path d="M-11 0q11 6 22 0z" fill="hsl(var(--brand-hover))" />
            <circle cx="0" cy="-3" r="9" fill="hsl(var(--motif-gold) / 0.4)" filter="url(#bd-soft)" />
            <path
              d="M0 -3c2.4 3 3.4 5 3.4 7a3.4 3.4 0 1 1-6.8 0c0-1.6.7-3 2-4.2-.2 1.4.5 2.2 1.4 2.4z"
              fill="hsl(var(--motif-gold))"
              style={{ transformOrigin: "0 4px", animation: `flame ${3 + p.d}s ease-in-out infinite` }}
            />
          </g>
        ))}

        {/* birds */}
        <g stroke="hsl(var(--text) / 0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ animation: "drift-x 26s ease-in-out infinite" }}>
          <path d="M120 80q10 -10 20 0q10 -10 20 0" />
          <path d="M170 60q8 -8 16 0q8 -8 16 0" opacity="0.8" />
          <path d="M150 100q7 -7 14 0q7 -7 14 0" opacity="0.6" />
        </g>
      </g>

      <rect width="800" height="380" rx="16" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
    </svg>
  );
}
