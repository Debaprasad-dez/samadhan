import { cn } from "@/lib/utils";

// Living gradient-mesh background (graphics addendum §2.5 / §4) — a slow-drifting
// multi-stop radial field in the theme palette, replacing flat --bg. Every stop
// is a theme token, so it recolours across all 12 theme×mode combos. The drift is
// GPU-composited (transform only) and frozen under reduced-motion; the mesh itself
// (the colour field) stays, so the static state is still rich, never blank.

type Variant = "dawn" | "ambient";

// Each variant is a composition of radial stops. `dawn` warms the upper-right
// (the rising sun) and cools the lower-left; `ambient` is a calmer all-over wash
// for non-hero Tier-A surfaces.
const VARIANTS: Record<Variant, string> = {
  dawn: [
    "radial-gradient(62% 80% at 80% 8%, hsl(var(--motif-gold) / 0.55), transparent 60%)",
    "radial-gradient(54% 72% at 64% 20%, hsl(var(--brand) / 0.42), transparent 62%)",
    "radial-gradient(90% 80% at 12% 104%, hsl(var(--accent) / 0.20), transparent 60%)",
    "radial-gradient(70% 60% at 50% 128%, hsl(var(--motif-3) / 0.16), transparent 60%)",
  ].join(","),
  ambient: [
    "radial-gradient(60% 70% at 18% 12%, hsl(var(--brand) / 0.16), transparent 60%)",
    "radial-gradient(60% 70% at 88% 18%, hsl(var(--accent) / 0.14), transparent 60%)",
    "radial-gradient(80% 80% at 50% 120%, hsl(var(--motif-gold) / 0.12), transparent 60%)",
  ].join(","),
};

export function GradientMesh({
  className,
  variant = "dawn",
  base = "hsl(var(--bg))",
}: {
  className?: string;
  variant?: Variant;
  /** Base fill under the mesh. Defaults to the page --bg so the field blends
   *  seamlessly into the surrounding layout rather than reading as a panel. */
  base?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: base }}
    >
      <div
        className="mesh-anim absolute inset-0"
        style={{ backgroundImage: VARIANTS[variant] }}
      />
    </div>
  );
}
