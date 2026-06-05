import { cn } from "@/lib/utils";

// Themed empty-state illustrations (design §5.2). Stylized vector art that
// recolours per theme via --motif-*/--brand tokens. Decorative (aria-hidden):
// every usage pairs them with a visible title, satisfying §10.2.

type Props = { className?: string };

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 170"
      fill="none"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full max-w-[240px]", className)}
    >
      {children}
    </svg>
  );
}

const G = "hsl(var(--motif-gold))";
const M1 = "hsl(var(--motif-1))";
const M2 = "hsl(var(--motif-2))";
const M3 = "hsl(var(--motif-3))";
const BR = "hsl(var(--brand))";
const LINE = "hsl(var(--border-strong))";
const SOFT = "hsl(var(--surface-muted))";
const SUB = "hsl(var(--text) / 0.55)";

/** Citizen looking to a horizon with a rising sun + cityscape (§5.2.1). */
export function EmptyCases({ className }: Props) {
  return (
    <Frame className={className}>
      <circle cx="170" cy="70" r="26" fill={G} opacity="0.85" />
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={170 + Math.cos(a) * 32}
            y1={70 + Math.sin(a) * 32}
            x2={170 + Math.cos(a) * 40}
            y2={70 + Math.sin(a) * 40}
            stroke={G}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
      <rect x="120" y="78" width="18" height="42" rx="2" fill={M2} opacity="0.6" />
      <rect x="142" y="64" width="20" height="56" rx="2" fill={M1} opacity="0.7" />
      <rect x="166" y="86" width="16" height="34" rx="2" fill={M3} opacity="0.6" />
      <rect x="186" y="72" width="18" height="48" rx="2" fill={M2} opacity="0.55" />
      {/* figure */}
      <circle cx="64" cy="78" r="10" fill={BR} />
      <path d="M64 88c-12 0-18 10-18 26h36c0-16-6-26-18-26z" fill={BR} />
      <line x1="20" y1="120" x2="220" y2="120" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
    </Frame>
  );
}

/** A village chaupal — a tree over a low platform (§5.2.2). */
export function EmptyFeed({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="40" y="110" width="160" height="14" rx="4" fill={SOFT} stroke={LINE} strokeWidth="2" />
      <line x1="56" y1="124" x2="56" y2="140" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <line x1="184" y1="124" x2="184" y2="140" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <line x1="150" y1="40" x2="150" y2="110" stroke={M3} strokeWidth="5" strokeLinecap="round" />
      <circle cx="150" cy="44" r="30" fill={M3} opacity="0.7" />
      <circle cx="128" cy="54" r="20" fill={M3} opacity="0.55" />
      <circle cx="172" cy="54" r="20" fill={M3} opacity="0.55" />
      {/* two seated figures */}
      <circle cx="78" cy="98" r="8" fill={M1} />
      <path d="M78 106c-9 0-13 4-13 4h26s-4-4-13-4z" fill={M1} />
      <circle cx="104" cy="98" r="8" fill={M2} />
      <path d="M104 106c-9 0-13 4-13 4h26s-4-4-13-4z" fill={M2} />
    </Frame>
  );
}

/** Inbox zero — a tidy desk with a clay lamp (§5.2.3). */
export function EmptyInbox({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="44" y="96" width="152" height="40" rx="6" fill={SOFT} stroke={LINE} strokeWidth="2" />
      <rect x="60" y="74" width="60" height="26" rx="3" fill="none" stroke={LINE} strokeWidth="2.5" />
      <path d="M60 100l30-14 30 14" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* diya */}
      <path d="M150 104c2 5 7 7 14 7s12-2 14-7c-2 3-7 5-14 5s-12-2-14-5z" fill={BR} />
      <ellipse cx="164" cy="104" rx="14" ry="3" fill={BR} />
      <path d="M164 86c4 4 6 7 6 10a6 6 0 1 1-12 0c0-2 1-4 3-6-.2 2 .8 3 2 3 0-3 .5-5 1-7z" fill={G} />
      {/* check */}
      <circle cx="90" cy="60" r="12" fill={M2} opacity="0.85" />
      <path d="M85 60l4 4 7-8" stroke="hsl(var(--surface))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Frame>
  );
}

/** A temple bell at rest (§5.2.4). */
export function EmptyNotifications({ className }: Props) {
  return (
    <Frame className={className}>
      <line x1="120" y1="24" x2="120" y2="44" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M120 44c-3 0-5 3-5 7 0 6-14 12-14 34 0 10 8 14 19 14s19-4 19-14c0-22-14-28-14-34 0-4-2-7-5-7z" fill={M1} opacity="0.85" stroke={BR} strokeWidth="2" />
      <circle cx="120" cy="104" r="4" fill={G} />
      <path d="M150 64q10 6 0 12M168 58q18 10 0 24" stroke={SUB} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M90 64q-10 6 0 12M72 58q-18 10 0 24" stroke={SUB} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
    </Frame>
  );
}

/** Scattered dots resolving into a rangoli (§5.2.5). */
export function EmptyClusters({ className }: Props) {
  return (
    <Frame className={className}>
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <g key={i}>
            <circle cx={120 + Math.cos(a) * 36} cy={85 + Math.sin(a) * 36} r="7" fill={i % 2 ? M1 : M2} />
            <path
              d={`M120 85L${120 + Math.cos(a) * 36} ${85 + Math.sin(a) * 36}`}
              stroke={LINE}
              strokeWidth="1.5"
              opacity="0.4"
            />
          </g>
        );
      })}
      <circle cx="120" cy="85" r="13" fill={G} />
      <circle cx="120" cy="85" r="22" fill="none" stroke={BR} strokeWidth="2" strokeDasharray="3 5" />
    </Frame>
  );
}

/** Magnifier over a stylised map of India (§5.2.6). */
export function EmptySearch({ className }: Props) {
  return (
    <Frame className={className}>
      <path
        d="M96 36l20 6 14-4 10 12-6 16 8 14-10 20-16 6-8 18-14-10-16 2-6-18-12-10 10-16-6-14 14-10 22-8z"
        fill={SOFT}
        stroke={LINE}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="150" cy="96" r="26" fill="none" stroke={BR} strokeWidth="5" />
      <line x1="170" y1="116" x2="190" y2="136" stroke={BR} strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="96" r="26" fill={G} opacity="0.12" />
    </Frame>
  );
}

/** 404 — a wanderer at a crossroads with a milestone stone (§5.2.8). */
export function Error404({ className }: Props) {
  return (
    <Frame className={className}>
      <line x1="20" y1="124" x2="220" y2="124" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M120 124l-40 -8M120 124l46 -6" stroke={LINE} strokeWidth="2" opacity="0.5" />
      {/* signpost */}
      <line x1="166" y1="70" x2="166" y2="124" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M166 76h34l-6 8 6 8h-34z" fill={M1} opacity="0.85" />
      <path d="M166 98h-30l6 8-6 8h30z" fill={M2} opacity="0.8" />
      {/* figure */}
      <circle cx="70" cy="86" r="10" fill={BR} />
      <path d="M70 96c-12 0-18 10-18 28h36c0-18-6-28-18-28z" fill={BR} />
      <text x="120" y="150" textAnchor="middle" fontSize="18" fontWeight="700" fill={SUB} fontFamily="var(--font-baloo)">404</text>
    </Frame>
  );
}

/** 500 — a kite with a cut string, drifting gently (§5.2.7). */
export function Error500({ className }: Props) {
  return (
    <Frame className={className}>
      <g transform="rotate(12 120 70)">
        <path d="M120 36l28 30-28 30-28-30z" fill={M1} opacity="0.9" />
        <path d="M120 36v60M92 66h56" stroke="hsl(var(--surface))" strokeWidth="2" opacity="0.7" />
        <path d="M120 96l-4 12 6 6-6 6 6 8" stroke={G} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* cut string drifting away */}
      <path d="M150 120q-20 6 -40 -2t-50 8" stroke={LINE} strokeWidth="2" strokeDasharray="2 6" fill="none" strokeLinecap="round" opacity="0.6" />
    </Frame>
  );
}
