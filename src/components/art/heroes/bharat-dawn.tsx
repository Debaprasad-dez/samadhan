import { cn } from "@/lib/utils";

// Sunrise over the Varanasi ghats (design §3.1). Rotating sun rays (slow loop),
// temple silhouettes, ghat steps, rising incense. Token-coloured, reduced-motion safe.
export function HeroBharatDawn({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="bdSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand-soft))" />
          <stop offset="100%" stopColor="hsl(var(--surface))" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" rx="14" fill="url(#bdSky)" />

      {/* sun + rotating rays */}
      <g style={{ transformOrigin: "278px 116px", animation: "spin-slow 24s linear infinite" }}>
        {[...Array(12)].map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={278 + Math.cos(a) * 44}
              y1={116 + Math.sin(a) * 44}
              x2={278 + Math.cos(a) * 56}
              y2={116 + Math.sin(a) * 56}
              stroke="hsl(var(--motif-gold))"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        })}
      </g>
      <circle cx="278" cy="116" r="34" fill="hsl(var(--motif-gold))" />
      <circle cx="278" cy="116" r="34" fill="hsl(var(--brand))" opacity="0.25" />

      {/* temple silhouettes */}
      <g fill="hsl(var(--text) / 0.42)">
        <path d="M70 150v-44a14 14 0 0 1 28 0v44z" />
        <path d="M84 96c6-10 6-16 0-24-6 8-6 14 0 24z" />
        <rect x="116" y="120" width="40" height="30" />
        <path d="M116 120l20-18 20 18z" />
        <rect x="132" y="104" width="8" height="10" />
      </g>

      {/* ghat steps */}
      <g fill="hsl(var(--surface-muted))" stroke="hsl(var(--border-strong))" strokeWidth="1">
        <rect x="0" y="150" width="400" height="12" />
        <rect x="0" y="162" width="400" height="12" opacity="0.85" />
        <rect x="0" y="174" width="400" height="26" opacity="0.7" />
      </g>

      {/* incense smoke */}
      <path
        d="M180 150c-6-10 6-16 0-26s6-16 0-26"
        fill="none"
        stroke="hsl(var(--text) / 0.25)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ transformOrigin: "180px 120px", animation: "sway 7s ease-in-out infinite" }}
      />
      {/* birds */}
      <g stroke="hsl(var(--text) / 0.5)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M120 56q6-6 12 0q6-6 12 0" />
        <path d="M150 44q5-5 10 0q5-5 10 0" opacity="0.7" />
      </g>
    </svg>
  );
}
