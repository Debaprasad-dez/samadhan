import { CategoryIcon } from "@/components/art/category-icon";
import { cn } from "@/lib/utils";

// Professional image placeholder for cards without a photo. A themed gradient +
// a faint seeded geometric pattern + a soft corner glow + a centred category
// glyph in a frosted disc. Deterministic per `seed`, so a list of cards varies
// subtly instead of repeating one blurry blob. Token-driven → works in every
// theme×mode. Use `compact` for tiny thumbnails.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  return h;
}

const MOTIFS = ["--motif-1", "--motif-2", "--motif-3", "--motif-gold"];

export function CardArtwork({
  category,
  seed = "",
  compact = false,
  className,
}: {
  category?: string;
  seed?: string;
  compact?: boolean;
  className?: string;
}) {
  const h = hash(seed || category || "samadhan");
  const angle = 115 + (h % 55);
  const variant = h % 3;
  const motif = MOTIFS[h % MOTIFS.length];
  const pid = `cart-${h.toString(36)}`;

  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(${angle}deg, hsl(var(--surface-muted)), hsl(var(--brand-soft)))`,
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {variant === 0 && (
            <pattern
              id={pid}
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform={`rotate(${h % 25})`}
            >
              <circle cx="2" cy="2" r="1.3" fill={`hsl(var(${motif}) / 0.16)`} />
            </pattern>
          )}
          {variant === 1 && (
            <pattern
              id={pid}
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
              patternTransform={`rotate(${25 + (h % 25)})`}
            >
              <path
                d="M0 8h16"
                stroke={`hsl(var(${motif}) / 0.13)`}
                strokeWidth="1.4"
              />
            </pattern>
          )}
          {variant === 2 && (
            <pattern
              id={pid}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M12 0a12 12 0 0 1 12 12"
                fill="none"
                stroke={`hsl(var(${motif}) / 0.13)`}
                strokeWidth="1.2"
              />
            </pattern>
          )}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pid})`} />
      </svg>

      {/* soft corner glow */}
      <div
        className="absolute -right-5 -top-5 h-16 w-16 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(var(${motif}) / 0.22), transparent 70%)`,
        }}
      />

      {/* centred category glyph */}
      <div className="absolute inset-0 grid place-items-center">
        {compact ? (
          <CategoryIcon
            department={category ?? ""}
            className="text-brand/85 h-5 w-5"
          />
        ) : (
          <div className="bg-surface/70 ring-border shadow-elev-1 grid h-11 w-11 place-items-center rounded-2xl ring-1 backdrop-blur-sm">
            <CategoryIcon
              department={category ?? ""}
              className="text-brand h-[22px] w-[22px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
