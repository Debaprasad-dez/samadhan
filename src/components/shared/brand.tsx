import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Samadhan mark (design §7.9): a resolution ring (citizen + state coming full
 * circle) with an open seam at the top, and a gold checkmark in the centre —
 * "a complaint brought to resolution". Recolours per theme via CSS tokens.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Samadhan"
    >
      {/* resolution ring with an open seam (rotated so the gap sits top-right) */}
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="hsl(var(--brand))"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="64 18"
        transform="rotate(-58 16 16)"
      />
      {/* gold resolution check */}
      <path
        d="M10.2 16.4l3.8 3.9 7.8-8.6"
        fill="none"
        stroke="hsl(var(--motif-gold))"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SIZES = {
  md: { mark: "h-7 w-7", text: "text-xl", gap: "gap-2" },
  lg: { mark: "h-12 w-12", text: "text-4xl", gap: "gap-3" },
} as const;

export function Brand({
  href = "/",
  markOnly = false,
  size = "md",
  className,
}: {
  href?: string;
  markOnly?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <Link
      href={href}
      aria-label="Samadhan home"
      className={cn("flex items-center", s.gap, className)}
    >
      <BrandMark className={s.mark} />
      {!markOnly && (
        <span
          className={cn(
            "font-display text-foreground font-semibold tracking-tight",
            s.text,
          )}
        >
          Samadhan
        </span>
      )}
    </Link>
  );
}
