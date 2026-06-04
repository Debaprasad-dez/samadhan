import { cn } from "@/lib/utils";

/**
 * A small lit diya (oil lamp) for the header (design §5.3 / §7.8). The flame
 * flickers subtly via a CSS keyframe (GPU-friendly transform/opacity) and a soft
 * glow pulses behind it. Purely decorative; reduced-motion freezes it to a
 * designed static frame. Recolours per theme via tokens.
 */
export function AmbientLamp({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-7 w-7 items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--motif-gold) / 0.55), transparent 64%)",
          animation: "diya-glow 4.5s ease-in-out infinite",
        }}
      />
      <svg viewBox="0 0 24 24" className="relative h-6 w-6">
        {/* flame */}
        <path
          d="M12 3.4c2 2.5 3 4.1 3 5.9a3 3 0 1 1-6 0c0-1.2.5-2.3 1.4-3.3-.2 1 .4 1.8 1.2 2 .1-1.6.3-3.1.4-4.6z"
          fill="hsl(var(--motif-gold))"
          style={{ transformOrigin: "12px 12px", animation: "flame 4s ease-in-out infinite" }}
        />
        {/* inner flame */}
        <path
          d="M12 6.2c1 1.4 1.5 2.4 1.5 3.4a1.5 1.5 0 1 1-3 0c0-.8.4-1.5 1.1-2.1.0.8.2 1.1.4 1.2z"
          fill="hsl(var(--brand))"
          opacity="0.7"
        />
        {/* diya bowl */}
        <path
          d="M3.5 14.2c1.7 2.3 4.9 3.6 8.5 3.6s6.8-1.3 8.5-3.6c-1.1 1.9-4.3 3.2-8.5 3.2s-7.4-1.3-8.5-3.2z"
          fill="hsl(var(--brand))"
        />
        <ellipse cx="12" cy="14.2" rx="8.5" ry="2" fill="hsl(var(--brand-hover))" />
      </svg>
    </span>
  );
}
