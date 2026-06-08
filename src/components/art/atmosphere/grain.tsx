import { cn } from "@/lib/utils";

// Animated film-grain overlay (graphics addendum §2.2) — the single biggest
// "cheap → expensive" lever. A tiled fractal-noise tile, oversized and nudged in
// GPU-composited steps so it shimmers like real grain, blended soft-light at low
// opacity. Decorative, never intercepts pointer. Reduced-motion freezes it to a
// still grain (the @media rule in globals.css kills the animation, not the texture).
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Grain({
  className,
  opacity = 0.07,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="grain-anim absolute -inset-[40%] mix-blend-soft-light"
        style={{
          opacity,
          backgroundImage: `url("${NOISE}")`,
          backgroundSize: "180px 180px",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
