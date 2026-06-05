import { cn } from "@/lib/utils";

/**
 * A Madhubani (Mithila) kohbar scene (design §3.2). Authentic double-outline
 * linework with cross-hatch/dot fills, an ornate peacock with eyed tail-feathers,
 * a pair of fish, opening lotuses, sun & moon faces, and a bamboo grove — dense,
 * with little empty space, in the natural-dye palette. Colour from theme tokens.
 */
export function HeroMithilaBloom({ className }: { className?: string }) {
  const M1 = "hsl(var(--motif-1))";
  const M2 = "hsl(var(--motif-2))";
  const M3 = "hsl(var(--motif-3))";
  const INK = "hsl(var(--text) / 0.72)";
  const GOLD = "hsl(var(--motif-gold))";

  return (
    <svg
      viewBox="0 0 800 380"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <pattern id="mb-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="0.7" />
        </pattern>
        <pattern id="mb-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="0.9" fill={INK} />
        </pattern>
        <clipPath id="mb-clip"><rect width="800" height="380" rx="16" /></clipPath>
      </defs>

      <g clipPath="url(#mb-clip)">
        <rect width="800" height="380" fill="hsl(var(--surface))" />
        <rect width="800" height="380" fill="url(#mb-dots)" opacity="0.35" />

        <rect x="12" y="12" width="776" height="356" rx="8" fill="none" stroke={M1} strokeWidth="3" />
        <rect x="20" y="20" width="760" height="340" rx="5" fill="none" stroke={INK} strokeWidth="1.5" />

        {/* sun face (left) + moon face (right) */}
        {[
          { x: 96, y: 84, c: M3, moon: false },
          { x: 704, y: 84, c: M2, moon: true },
        ].map((s) => (
          <g key={s.x} transform={`translate(${s.x} ${s.y})`}>
            {!s.moon &&
              [...Array(12)].map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 40} y2={Math.sin(a) * 40} stroke={s.c} strokeWidth="2.5" strokeLinecap="round" />;
              })}
            <circle r="28" fill={s.moon ? "hsl(var(--motif-2) / 0.22)" : "hsl(var(--motif-3) / 0.22)"} stroke={s.c} strokeWidth="2.5" />
            <circle r="22" fill="none" stroke={INK} strokeWidth="1" />
            <circle cx="-8" cy="-3" r="2.4" fill={INK} />
            <circle cx="8" cy="-3" r="2.4" fill={INK} />
            <path d="M-8 8q8 7 16 0" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        ))}

        {/* bamboo grove (left) */}
        <g stroke={M3} strokeWidth="3" fill="none" strokeLinecap="round">
          {[60, 78].map((x) => (
            <g key={x}>
              <line x1={x} y1="340" x2={x} y2="150" />
              {[300, 250, 200].map((y) => (
                <line key={y} x1={x - 2} y1={y} x2={x + 2} y2={y} strokeWidth="5" />
              ))}
              <path d={`M${x} 200q22 -10 30 -28M${x} 250q24 -8 34 -24`} stroke={M2} strokeWidth="2" />
            </g>
          ))}
        </g>

        {/* ornate peacock (centre-right) */}
        <g transform="translate(470 150)">
          <g style={{ transformOrigin: "0px 70px", animation: "sway 9s ease-in-out infinite" }}>
            {[...Array(11)].map((_, i) => {
              const a = -Math.PI * 0.62 + (i / 10) * Math.PI * 1.24;
              const ex = Math.cos(a) * 150;
              const ey = 70 + Math.sin(a) * 150;
              const rot = (a * 180) / Math.PI + 90;
              return (
                <g key={i}>
                  <path d={`M0 70 Q ${Math.cos(a) * 70} ${70 + Math.sin(a) * 70} ${ex} ${ey}`} fill="none" stroke={M2} strokeWidth="2.5" />
                  <ellipse cx={ex} cy={ey} rx="11" ry="14" fill={M2} stroke={INK} strokeWidth="1" transform={`rotate(${rot} ${ex} ${ey})`} />
                  <ellipse cx={ex} cy={ey} rx="7" ry="9" fill={GOLD} transform={`rotate(${rot} ${ex} ${ey})`} />
                  <circle cx={ex} cy={ey} r="3.5" fill={M1} />
                </g>
              );
            })}
          </g>
          <path d="M0 70c-18 0-30 16-30 38s12 30 30 30 26-14 26-32-8-36-26-36z" fill={M2} stroke={INK} strokeWidth="1.6" />
          <path d="M0 70c-18 0-30 16-30 38s12 30 30 30" fill="url(#mb-hatch)" opacity="0.5" />
          <path d="M-2 78q-30 -18 -34 -54" fill="none" stroke={M2} strokeWidth="10" strokeLinecap="round" />
          <circle cx="-38" cy="20" r="11" fill={M2} stroke={INK} strokeWidth="1.4" />
          <path d="M-46 12l-12 -8 6 10-10 4 12 4" fill={M1} stroke={INK} strokeWidth="1" />
          {[-2, 4, 10].map((dx, i) => (
            <line key={i} x1={-38 + dx} y1="10" x2={-38 + dx} y2="-2" stroke={INK} strokeWidth="1.4" />
          ))}
          <circle cx="-42" cy="17" r="2" fill={INK} />
        </g>

        {/* lotus pond */}
        <rect x="0" y="300" width="800" height="80" fill={M2} opacity="0.14" />
        <path d="M0 300q200 -14 400 0t400 0" fill="none" stroke={M2} strokeWidth="2" opacity="0.4" />
        {[140, 300].map((x, idx) => (
          <g key={x} transform={`translate(${x} 300)`} style={{ transformOrigin: `${x}px 300px`, animation: `bob ${7 + idx * 2}s ease-in-out infinite` }}>
            {[...Array(7)].map((_, i) => {
              const a = -Math.PI + (i / 6) * Math.PI;
              return <path key={i} d={`M0 0 q ${Math.cos(a) * 12} -26 ${Math.cos(a) * 26} -8 q ${-Math.cos(a) * 6} 14 ${-Math.cos(a) * 26} 8 z`} fill={M1} stroke={INK} strokeWidth="1" />;
            })}
            <circle cx="0" cy="-6" r="6" fill={GOLD} stroke={INK} strokeWidth="1" />
          </g>
        ))}

        {/* fish pair */}
        <g style={{ animation: "drift-x 18s ease-in-out infinite" }}>
          {[
            { x: 220, y: 344, f: 1, c: M3 },
            { x: 300, y: 352, f: -1, c: M1 },
          ].map((fi) => (
            <g key={fi.x} transform={`translate(${fi.x} ${fi.y}) scale(${fi.f} 1)`}>
              <path d="M-22 0q22 -16 44 0q-22 16 -44 0z" fill={fi.c} stroke={INK} strokeWidth="1.4" />
              <path d="M20 0l16 -10v20z" fill={fi.c} stroke={INK} strokeWidth="1.4" />
              <path d="M-14 -3q5 4 0 8M-6 -5q5 6 0 11M2 -5q5 6 0 11" fill="none" stroke={INK} strokeWidth="1" />
              <circle cx="-14" cy="-2" r="2" fill={INK} />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
