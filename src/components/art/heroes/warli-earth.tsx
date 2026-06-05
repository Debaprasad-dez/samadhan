import { cn } from "@/lib/utils";

// The Warli tarpa dance (design §3.3): a concentric ring of stick figures
// rotating very slowly around a central musician. Monochrome white-on-ochre.
function Figure() {
  return (
    <g stroke="hsl(var(--motif-1))" strokeWidth="1.4" strokeLinecap="round" fill="hsl(var(--motif-1))">
      <circle cx="0" cy="-13" r="3" />
      <path d="M0 -10 L-5 0 L5 0 Z" />
      <path d="M-5 0 L5 0 L0 10 Z" />
      <path d="M-4 -6 L-12 -10 M4 -6 L12 -10" fill="none" />
      <path d="M0 10 L-6 20 M0 10 L6 20" fill="none" />
    </g>
  );
}

export function HeroWarliEarth({ className }: { className?: string }) {
  const N = 11;
  return (
    <svg
      viewBox="0 0 400 200"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <rect width="400" height="200" rx="14" fill="hsl(var(--surface-muted))" />
      {/* subtle wall grain handled globally; periphery trees */}
      {[40, 360].map((x) => (
        <g key={x} stroke="hsl(var(--motif-1))" strokeWidth="1.6" fill="none">
          <line x1={x} y1="170" x2={x} y2="110" />
          <path d={`M${x} 110 l-16 26 h32 z`} fill="hsl(var(--motif-1))" opacity="0.85" />
          <path d={`M${x} 96 l-12 20 h24 z`} fill="hsl(var(--motif-1))" opacity="0.7" />
        </g>
      ))}

      {/* rotating dance ring */}
      <g style={{ transformOrigin: "200px 104px", animation: "spin-slow 32s linear infinite" }}>
        <circle cx="200" cy="104" r="58" fill="none" stroke="hsl(var(--motif-1))" strokeWidth="1" opacity="0.4" />
        {[...Array(N)].map((_, i) => {
          const a = (i / N) * 360;
          return (
            <g key={i} transform={`rotate(${a} 200 104) translate(200 46)`}>
              <Figure />
            </g>
          );
        })}
      </g>

      {/* central musician with tarpa */}
      <g transform="translate(200 104)">
        <circle cx="0" cy="-10" r="3.5" fill="hsl(var(--motif-1))" />
        <path d="M0 -7 L-5 3 L5 3 Z M-5 3 L5 3 L0 13 Z" fill="hsl(var(--motif-1))" />
        <path d="M4 -2 q18 4 14 18" fill="none" stroke="hsl(var(--motif-1))" strokeWidth="1.6" />
        <circle cx="20" cy="18" r="5" fill="hsl(var(--brand))" />
      </g>
    </svg>
  );
}
