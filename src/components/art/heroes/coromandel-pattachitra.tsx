import { cn } from "@/lib/utils";

// A Pattachitra frame around a rotating lotus medallion with a marching row of
// hamsa (geese) (design §3.5). Strong outlines, vivid pigment. Token-coloured.
export function HeroCoromandelPattachitra({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <rect width="400" height="200" rx="14" fill="hsl(var(--surface))" />
      {/* ornate double frame */}
      <rect x="10" y="10" width="380" height="180" rx="8" fill="none" stroke="hsl(var(--text) / 0.7)" strokeWidth="2.5" />
      <rect x="18" y="18" width="364" height="164" rx="5" fill="none" stroke="hsl(var(--motif-1))" strokeWidth="2" />
      {/* scalloped top band */}
      <g fill="hsl(var(--motif-3))" stroke="hsl(var(--text) / 0.6)" strokeWidth="0.8">
        {[...Array(22)].map((_, i) => (
          <circle key={i} cx={26 + i * 16.5} cy="18" r="5" opacity="0.8" />
        ))}
      </g>

      {/* central lotus medallion */}
      <g style={{ transformOrigin: "200px 92px", animation: "spin-slow 34s linear infinite" }}>
        {[16, 11].map((rr, ring) =>
          [...Array(12)].map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + ring * 0.26;
            const x = 200 + Math.cos(a) * rr;
            const y = 92 + Math.sin(a) * rr;
            return (
              <path
                key={`${ring}-${i}`}
                d={`M200 92 Q ${x} ${y} ${200 + Math.cos(a) * (rr + 16)} ${92 + Math.sin(a) * (rr + 16)}`}
                fill="none"
                stroke={ring ? "hsl(var(--motif-3))" : "hsl(var(--motif-1))"}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          }),
        )}
        <circle cx="200" cy="92" r="9" fill="hsl(var(--motif-gold))" stroke="hsl(var(--text) / 0.6)" strokeWidth="1" />
      </g>

      {/* marching hamsa (geese) along the lower band */}
      <g style={{ animation: "drift-x 14s ease-in-out infinite" }}>
        {[70, 150, 250, 330].map((x) => (
          <g key={x} transform={`translate(${x} 158)`} fill="hsl(var(--motif-2))" stroke="hsl(var(--text) / 0.6)" strokeWidth="1">
            <ellipse rx="12" ry="7" />
            <path d="M-10 -3q-8 -10 -2 -16q4 6 8 6z" />
            <path d="M11 -4q8 -2 10 2q-6 1 -8 4z" fill="hsl(var(--motif-gold))" />
            <circle cx="-12" cy="-12" r="1.4" fill="hsl(var(--text))" />
          </g>
        ))}
      </g>
    </svg>
  );
}
