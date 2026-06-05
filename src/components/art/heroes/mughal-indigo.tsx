import { cn } from "@/lib/utils";

const GOLD = "hsl(var(--motif-gold))";

// One 8-point star (two overlaid rotated squares) for the jali tessellation.
function star8(cx: number, cy: number, R: number, r: number) {
  let p = "";
  for (let i = 0; i < 16; i++) {
    const rad = (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 ? r : R;
    p += `${i ? "L" : "M"}${(cx + Math.cos(rad) * rr).toFixed(1)} ${(cy + Math.sin(rad) * rr).toFixed(1)} `;
  }
  return p + "Z";
}

/**
 * A jali screen beneath a cusped (multifoil) arch with pietra-dura floral
 * spandrels and gold arabesque (design §3.4). A band of dawn light passes across
 * the lattice; the gold shimmers. Authentic 8-fold star-and-cross tessellation.
 */
export function HeroMughalIndigo({ className }: { className?: string }) {
  const stars: { cx: number; cy: number }[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 7; c++)
      stars.push({ cx: 232 + c * 48, cy: 64 + r * 48 });

  return (
    <svg viewBox="0 0 800 380" role="presentation" aria-hidden className={cn("h-auto w-full", className)}>
      <defs>
        <linearGradient id="mi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--surface))" />
          <stop offset="100%" stopColor="hsl(var(--bg))" />
        </linearGradient>
        <linearGradient id="mi-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--motif-gold) / 0)" />
          <stop offset="50%" stopColor="hsl(var(--motif-gold) / 0.5)" />
          <stop offset="100%" stopColor="hsl(var(--motif-gold) / 0)" />
        </linearGradient>
        {/* cusped multifoil arch */}
        <clipPath id="mi-arch">
          <path d="M236 340V150c0-70 40-110 164-110s164 40 164 110v190z" />
        </clipPath>
        <clipPath id="mi-clip"><rect width="800" height="380" rx="16" /></clipPath>
      </defs>

      <g clipPath="url(#mi-clip)">
        <rect width="800" height="380" fill="url(#mi-sky)" />

        {/* jali behind the arch */}
        <g clipPath="url(#mi-arch)">
          <rect x="220" y="30" width="360" height="320" fill="hsl(var(--brand) / 0.16)" />
          {/* dawn light passing */}
          <rect x="220" y="30" width="200" height="320" fill="url(#mi-light)" style={{ animation: "drift-x 14s ease-in-out infinite, gold-sweep 7s ease-in-out infinite" }} />
          {/* connecting squares */}
          {stars.map((s, i) => (
            <rect key={`q${i}`} x={s.cx - 8} y={s.cy - 8} width="16" height="16" transform={`rotate(45 ${s.cx} ${s.cy})`} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.4" />
          ))}
          {/* 8-point stars */}
          {stars.map((s, i) => (
            <path key={`s${i}`} d={star8(s.cx, s.cy, 18, 8)} fill="none" stroke={GOLD} strokeWidth="1.1" opacity="0.7" />
          ))}
        </g>

        {/* cusped arch outline with multifoil cusps */}
        <path d="M236 340V150c0-70 40-110 164-110s164 40 164 110v190" fill="none" stroke={GOLD} strokeWidth="3" />
        <g fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.8">
          <path d="M300 70q14 -20 28 0M372 48q14 -18 28 0q14 -18 28 0q14 -18 28 0M472 70q14 -20 28 0" />
        </g>
        <path d="M396 24q4 -14 8 0q-4 8 -8 0z" fill={GOLD} />

        {/* side pietra-dura floral borders */}
        {[120, 680].map((x) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <line x1="0" y1="48" x2="0" y2="332" stroke={GOLD} strokeWidth="2" opacity="0.6" />
            {[90, 150, 210, 270].map((y) => (
              <g key={y} transform={`translate(0 ${y})`}>
                <path d="M0 0q-18 -8 -18 -22q12 4 18 14q6 -10 18 -14q0 14 -18 22z" fill="hsl(var(--motif-2) / 0.8)" stroke="hsl(var(--text) / 0.4)" strokeWidth="0.8" />
                <circle cx="0" cy="-6" r="3.5" fill="hsl(var(--motif-3))" />
                <circle cx="0" cy="2" r="2" fill={GOLD} />
              </g>
            ))}
          </g>
        ))}

        {/* gold arabesque corners (shimmer) */}
        <g stroke={GOLD} strokeWidth="2.2" fill="none" strokeLinecap="round" style={{ animation: "gold-sweep 8s ease-in-out infinite" }}>
          <path d="M30 54q40 -26 74 -8q-30 -4 -42 18q-2 -22 -32 -10z" />
          <path d="M770 54q-40 -26 -74 -8q30 -4 42 18q2 -22 32 -10z" />
          <path d="M30 330q34 -12 38 -46q10 26 38 22" />
          <path d="M770 330q-34 -12 -38 -46q-10 26 -38 22" />
        </g>

        {/* pietra-dura ruby/emerald inlay dots on the arch frame */}
        {[260, 320, 480, 540].map((x, i) => (
          <circle key={x} cx={x} cy={48 + (i % 2) * 8} r="3" fill={i % 2 ? "hsl(var(--motif-3))" : "hsl(var(--motif-2))"} />
        ))}
      </g>
      <rect width="800" height="380" rx="16" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
    </svg>
  );
}
