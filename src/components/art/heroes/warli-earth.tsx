import { cn } from "@/lib/utils";

// One Warli figure: two inverse triangles joined at the tips (torso + pelvis),
// a featureless circle head, stick limbs. Female figures get the round "ambada"
// bun. White rice-paste on ochre. (Research: en.wikipedia.org/wiki/Warli_painting)
function Figure({ female = false, arms = "down" }: { female?: boolean; arms?: "down" | "up" }) {
  const W = "hsl(var(--motif-1))";
  return (
    <g stroke={W} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill={W}>
      <circle cx="0" cy="-17" r="3.4" />
      {female && <circle cx="4.5" cy="-20" r="2.4" fill="none" strokeWidth="1.3" />}
      <path d="M-5 -13L5 -13L0 0Z" />
      <path d="M0 0L-5 13L5 13Z" />
      {arms === "up" ? (
        <path d="M0 -3L-11 -12M0 -3L11 -12" fill="none" />
      ) : (
        <path d="M0 -3L-11 4M0 -3L11 4" fill="none" />
      )}
      <path d="M-4 13L-9 24M4 13L9 24" fill="none" />
    </g>
  );
}

/** A dense Warli tribal-wall scene (design §3.3): a tarpa dance ring with joined
 *  hands, a central musician, the tree of life, huts, animals, and sun & moon. */
export function HeroWarliEarth({ className }: { className?: string }) {
  const W = "hsl(var(--motif-1))";
  const N = 12;
  return (
    <svg viewBox="0 0 800 380" role="presentation" aria-hidden className={cn("h-auto w-full", className)}>
      <defs>
        <clipPath id="we-clip"><rect width="800" height="380" rx="16" /></clipPath>
      </defs>
      <g clipPath="url(#we-clip)">
        <rect width="800" height="380" fill="hsl(var(--surface-muted))" />
        <rect x="0" y="0" width="800" height="380" fill="hsl(var(--brand) / 0.05)" />

        {/* double border */}
        <rect x="12" y="12" width="776" height="356" rx="8" fill="none" stroke={W} strokeWidth="2.5" opacity="0.9" />
        <rect x="20" y="20" width="760" height="340" rx="5" fill="none" stroke={W} strokeWidth="1" opacity="0.6" />

        {/* sun (top-left) + crescent moon (top-right) */}
        <g stroke={W} fill="none" strokeWidth="2" strokeLinecap="round">
          <circle cx="92" cy="70" r="14" />
          {[...Array(10)].map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={92 + Math.cos(a) * 18} y1={70 + Math.sin(a) * 18} x2={92 + Math.cos(a) * 26} y2={70 + Math.sin(a) * 26} />;
          })}
          <path d="M716 56a16 16 0 1 0 8 28 13 13 0 1 1-8-28z" fill={W} />
        </g>

        {/* tree of life (left) */}
        <g stroke={W} strokeWidth="2.2" fill="none" strokeLinecap="round">
          <line x1="150" y1="330" x2="150" y2="150" />
          {[230, 200, 170].map((y, i) => (
            <g key={y}>
              <path d={`M150 ${y}q-${30 + i * 4} -6 -${40 + i * 6} -26M150 ${y}q${30 + i * 4} -6 ${40 + i * 6} -26`} />
              <circle cx={150 - (40 + i * 6)} cy={y - 26} r="5" fill={W} />
              <circle cx={150 + (40 + i * 6)} cy={y - 26} r="5" fill={W} />
            </g>
          ))}
          <path d="M150 150q-14 -10 -16 -28M150 150q14 -10 16 -28" />
          {/* two birds */}
          <path d="M120 120q6 -7 12 0q6 -7 12 0M168 132q5 -6 10 0q5 -6 10 0" strokeWidth="1.8" />
        </g>

        {/* tarpa dance ring */}
        <g transform="translate(430 196)">
          <circle r="86" fill="none" stroke={W} strokeWidth="1" opacity="0.45" />
          {/* joined-hands ring (behind figures) */}
          <circle r="64" fill="none" stroke={W} strokeWidth="1.4" opacity="0.7" />
          <g style={{ transformOrigin: "0px 0px", animation: "spin-slow 40s linear infinite" }}>
            {[...Array(N)].map((_, i) => {
              const a = (i / N) * 360;
              return (
                <g key={i} transform={`rotate(${a}) translate(0 -64)`}>
                  <Figure female={i % 2 === 0} arms="up" />
                </g>
              );
            })}
          </g>
          {/* central musician with tarpa */}
          <g>
            <Figure />
            <path d="M9 -6q26 4 22 26" fill="none" stroke={W} strokeWidth="2" />
            <ellipse cx="34" cy="22" rx="7" ry="9" fill="none" stroke={W} strokeWidth="2" />
            <circle cx="34" cy="22" r="2.5" fill={W} />
          </g>
        </g>

        {/* huts + animals (right) */}
        <g stroke={W} strokeWidth="2" fill="none" strokeLinecap="round">
          {[[636, 250], [700, 270]].map(([x, y]) => (
            <g key={x}>
              <rect x={x} y={y} width="44" height={330 - y} />
              <path d={`M${x} ${y}l22 -22 22 22`} />
              <rect x={x + 16} y={y + 14} width="12" height={330 - y - 14} fill={W} opacity="0.25" />
            </g>
          ))}
          {/* deer */}
          <g transform="translate(610 320)">
            <path d="M0 0l8 -14 16 0 8 14" />
            <path d="M8 -14l-4 -12M24 -14l4 -12" />
            <circle cx="2" cy="-20" r="3.5" fill={W} />
            <path d="M-2 -22l-6 -8M2 -23l-2 -10" strokeWidth="1.4" />
          </g>
          {/* peacock */}
          <g transform="translate(560 322)">
            <circle cx="0" cy="-10" r="6" fill={W} />
            <path d="M0 -10q-14 -2 -22 10M0 -10q-12 4 -18 14M0 -10q-16 2 -24 2" strokeWidth="1.6" />
            <line x1="3" y1="-14" x2="6" y2="-22" strokeWidth="1.6" />
          </g>
        </g>

        {/* ground + farming figures */}
        <line x1="20" y1="332" x2="780" y2="332" stroke={W} strokeWidth="1.6" opacity="0.7" />
        <g transform="translate(250 322)"><Figure arms="down" /></g>
        <g transform="translate(290 322)"><Figure female arms="down" /></g>
      </g>
    </svg>
  );
}
