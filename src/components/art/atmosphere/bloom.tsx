// Layered light bloom (graphics addendum §2.5) — a soft, blurred glow built from a
// radial falloff plus a Gaussian blur, the way the reference sites halo their
// light sources (the rising sun, diya flames, gold accents). Renders inside an
// <svg>; each instance needs a unique `id` because it carries its own <defs>.

export function Bloom({
  id,
  cx,
  cy,
  r,
  color = "hsl(var(--motif-gold))",
  intensity = 1,
  className,
  style,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  color?: string;
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <g className={className} style={style} aria-hidden>
      <defs>
        <filter
          id={`${id}-blur`}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={r * 0.22} />
        </filter>
        <radialGradient id={`${id}-fall`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.85 * intensity} />
          <stop offset="45%" stopColor={color} stopOpacity={0.32 * intensity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r * 1.9}
        fill={`url(#${id}-fall)`}
        filter={`url(#${id}-blur)`}
      />
    </g>
  );
}
