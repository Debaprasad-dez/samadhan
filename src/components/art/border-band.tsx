import { cn } from "@/lib/utils";

// A themed section divider (design §9.3): a thin repeating motif band that
// recolours per theme via tokens. One component covers all six themes. Use
// sparingly at major section breaks.
export function BorderBand({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-full", className)}
      preserveAspectRatio="xMidYMid"
      role="presentation"
      aria-hidden
    >
      <defs>
        <pattern id="samadhan-band" width="28" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="3" fill="hsl(var(--motif-1))" opacity="0.85" />
          <path d="M14 2l3.2 5-3.2 5-3.2-5z" fill="hsl(var(--motif-gold))" />
          <circle cx="21" cy="7" r="2" fill="hsl(var(--motif-2))" opacity="0.8" />
          <path d="M0 7h28" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill="url(#samadhan-band)" />
    </svg>
  );
}
