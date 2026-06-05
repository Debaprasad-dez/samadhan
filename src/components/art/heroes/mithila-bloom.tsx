import { cn } from "@/lib/utils";

// A Madhubani lotus pond (design §3.2). Double-outline fish drifting, lotuses
// opening, characteristic fine linework. Token-coloured, reduced-motion safe.
export function HeroMithilaBloom({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="mbSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--surface))" />
          <stop offset="100%" stopColor="hsl(var(--brand-soft))" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" rx="14" fill="url(#mbSky)" />

      {/* pond */}
      <rect x="0" y="120" width="400" height="80" fill="hsl(var(--accent) / 0.18)" />
      <g stroke="hsl(var(--motif-2))" strokeWidth="1.5" opacity="0.4" fill="none">
        <path d="M0 138h400M0 158h400M0 178h400" />
      </g>

      {/* lotuses (double-line) */}
      {[80, 300].map((x, idx) => (
        <g
          key={x}
          style={{ transformOrigin: `${x}px 120px`, animation: `bob ${8 + idx * 2}s ease-in-out infinite` }}
        >
          {[...Array(7)].map((_, i) => {
            const a = -Math.PI + (i / 6) * Math.PI;
            return (
              <path
                key={i}
                d={`M${x} 120 q ${Math.cos(a) * 10} -22 ${Math.cos(a) * 22} -6 q ${-Math.cos(a) * 6} 12 ${-Math.cos(a) * 22} 6 z`}
                fill="hsl(var(--motif-1))"
                stroke="hsl(var(--text) / 0.5)"
                strokeWidth="1"
                opacity="0.9"
              />
            );
          })}
          <circle cx={x} cy="116" r="6" fill="hsl(var(--motif-gold))" />
        </g>
      ))}

      {/* fish (double-outline) drifting */}
      <g style={{ animation: "drift-x 16s ease-in-out infinite" }}>
        {[
          { x: 150, y: 165, c: "var(--motif-2)" },
          { x: 230, y: 178, c: "var(--motif-1)" },
          { x: 300, y: 168, c: "var(--motif-3)" },
        ].map((f) => (
          <g key={f.x} transform={`translate(${f.x} ${f.y})`}>
            <ellipse rx="18" ry="9" fill={`hsl(${f.c})`} stroke="hsl(var(--text) / 0.55)" strokeWidth="1.2" />
            <path d="M16 0l12 -8v16z" fill={`hsl(${f.c})`} stroke="hsl(var(--text) / 0.55)" strokeWidth="1.2" />
            <ellipse rx="11" ry="5" fill="none" stroke="hsl(var(--surface) / 0.7)" strokeWidth="1" />
            <circle cx="-9" cy="-2" r="1.6" fill="hsl(var(--text))" />
          </g>
        ))}
      </g>

      {/* vines */}
      <path d="M0 120q40 -30 80 -8t90 -6" fill="none" stroke="hsl(var(--motif-3))" strokeWidth="2" opacity="0.45" />
    </svg>
  );
}
