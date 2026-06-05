import { cn } from "@/lib/utils";

const M1 = "hsl(var(--motif-1))"; // cinnabar red
const M2 = "hsl(var(--motif-2))"; // leaf green
const M3 = "hsl(var(--motif-3))"; // haritala yellow
const GOLD = "hsl(var(--motif-gold))";
const INK = "hsl(var(--text) / 0.82)"; // the signature strong black outline

// One Odissi/Pattachitra dancer — tribhanga pose, almond eye, bold outline.
function Dancer({ flip = false }: { flip?: boolean }) {
  return (
    <g transform={flip ? "scale(-1 1)" : undefined} stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M0 -38c6 0 10 4 10 9s-4 9-10 9-9-4-9-9 3-9 9-9z" fill={M3} />
      <path d="M-9 -36q-6 -6 -2 -12q4 4 4 10" fill={INK} />
      <ellipse cx="3" cy="-30" rx="3" ry="1.6" fill="hsl(var(--surface))" stroke={INK} strokeWidth="0.6" />
      <circle cx="3" cy="-30" r="0.9" fill={INK} />
      <path d="M-2 -20q-10 8 -8 26l16 0q2 -18 -8 -26z" fill={M1} />
      <path d="M-2 -16q-16 -2 -20 -16M2 -16q14 6 12 22" fill="none" />
      <circle cx="-22" cy="-32" r="3" fill={M3} />
      <path d="M-6 6q-12 14 -6 30M6 6q10 12 4 28" fill="none" />
      <path d="M-7 36l6 0M-3 34l8 0" />
    </g>
  );
}

/** A Pattachitra panel (design §3.5): an ornate floral border framing a rotating
 *  lotus medallion, flanked by dancers, with a marching row of hamsa geese. */
export function HeroCoromandelPattachitra({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 380" role="presentation" aria-hidden className={cn("h-auto w-full", className)}>
      <defs>
        <pattern id="cp-border" width="44" height="36" patternUnits="userSpaceOnUse">
          <rect width="44" height="36" fill={M1} />
          <path d="M22 4q9 7 9 14t-9 14q-9 -7 -9 -14t9 -14z" fill={M3} stroke={INK} strokeWidth="1.2" />
          <circle cx="22" cy="18" r="3.5" fill={M1} stroke={INK} strokeWidth="0.8" />
          <path d="M2 18q6 -8 12 0M42 18q-6 8 -12 0" fill={M2} stroke={INK} strokeWidth="1" />
        </pattern>
        <clipPath id="cp-clip"><rect width="800" height="380" rx="16" /></clipPath>
      </defs>

      <g clipPath="url(#cp-clip)">
        <rect width="800" height="380" fill="hsl(var(--surface))" />

        {/* ornate floral border bands */}
        <rect x="0" y="0" width="800" height="36" fill="url(#cp-border)" />
        <rect x="0" y="344" width="800" height="36" fill="url(#cp-border)" />
        <rect x="0" y="36" width="36" height="308" fill="url(#cp-border)" />
        <rect x="764" y="36" width="36" height="308" fill="url(#cp-border)" />
        <rect x="36" y="36" width="728" height="308" fill="none" stroke={INK} strokeWidth="2" />
        <rect x="42" y="42" width="716" height="296" fill="none" stroke={M2} strokeWidth="1.5" />

        {/* inner field tint */}
        <rect x="44" y="44" width="712" height="292" fill="hsl(var(--brand) / 0.06)" />

        {/* rotating lotus medallion */}
        <g transform="translate(400 178)">
          <circle r="92" fill="none" stroke={INK} strokeWidth="1" opacity="0.4" />
          <g style={{ transformOrigin: "0px 0px", animation: "spin-slow 44s linear infinite" }}>
            {[0, 1, 2].map((ring) =>
              [...Array(12)].map((_, i) => {
                const a = (i / 12) * Math.PI * 2 + ring * 0.22;
                const R = 30 + ring * 24;
                const ex = Math.cos(a) * R;
                const ey = Math.sin(a) * R;
                const rot = (a * 180) / Math.PI + 90;
                const fill = [M1, M3, M2][ring];
                return (
                  <path
                    key={`${ring}-${i}`}
                    d={`M${ex} ${ey} q ${Math.cos(a) * 6 - Math.sin(a) * 9} ${Math.sin(a) * 6 + Math.cos(a) * 9} ${Math.cos(a) * 16} ${Math.sin(a) * 16} q ${Math.cos(a) * 6 + Math.sin(a) * 9} ${Math.sin(a) * 6 - Math.cos(a) * 9} 0 0 z`}
                    fill={fill}
                    stroke={INK}
                    strokeWidth="1.1"
                    transform={`rotate(${rot} ${ex} ${ey})`}
                  />
                );
              }),
            )}
          </g>
          <circle r="22" fill={M1} stroke={INK} strokeWidth="1.6" />
          <circle r="13" fill={GOLD} stroke={INK} strokeWidth="1.2" />
          <circle r="5" fill={M1} />
        </g>

        {/* flanking dancers */}
        <g transform="translate(150 250) scale(1.3)"><Dancer /></g>
        <g transform="translate(650 250) scale(1.3)"><Dancer flip /></g>

        {/* marching hamsa geese */}
        <g style={{ animation: "drift-x 16s ease-in-out infinite" }}>
          {[120, 300, 500, 680].map((x) => (
            <g key={x} transform={`translate(${x} 312)`} stroke={INK} strokeWidth="1.4">
              <ellipse rx="14" ry="8" fill="hsl(var(--surface))" />
              <path d="M-11 -4q-9 -12 -2 -19q5 7 9 7z" fill={M3} />
              <path d="M13 -5q9 -3 12 2q-7 1 -9 5z" fill={M1} />
              <circle cx="-14" cy="-13" r="1.6" fill={INK} />
              <path d="M-6 6q4 6 0 10M4 6q4 6 0 10" fill="none" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
