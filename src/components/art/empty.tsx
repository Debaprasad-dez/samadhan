import { cn } from "@/lib/utils";

// Themed empty-state illustrations (design §5.2): crafted vector scenes with a
// soft halo backdrop, ground shadow, gradient fills and layered detail. They
// recolour per theme via tokens. Decorative (aria-hidden) — paired with a title.

type Props = { className?: string };

const M1 = "hsl(var(--motif-1))";
const M2 = "hsl(var(--motif-2))";
const M3 = "hsl(var(--motif-3))";
const GOLD = "hsl(var(--motif-gold))";
const BR = "hsl(var(--brand))";
const LINE = "hsl(var(--border-strong))";
const SUB = "hsl(var(--text) / 0.5)";

function Frame({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 176"
      fill="none"
      role="presentation"
      aria-hidden
      className={cn("h-auto w-full max-w-[240px]", className)}
    >
      <defs>
        <radialGradient id={`${id}-halo`} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="hsl(var(--brand) / 0.12)" />
          <stop offset="100%" stopColor="hsl(var(--brand) / 0)" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="84" r="92" fill={`url(#${id}-halo)`} />
      <ellipse cx="120" cy="156" rx="78" ry="9" fill="hsl(var(--text) / 0.08)" />
      {children}
    </svg>
  );
}

export function EmptyCases({ className }: Props) {
  return (
    <Frame id="ec" className={className}>
      <defs>
        <radialGradient id="ec-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD} />
          <stop offset="100%" stopColor={BR} />
        </radialGradient>
      </defs>
      <circle cx="168" cy="70" r="34" fill="hsl(var(--motif-gold) / 0.18)" />
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={168 + Math.cos(a) * 30} y1={70 + Math.sin(a) * 30} x2={168 + Math.cos(a) * 38} y2={70 + Math.sin(a) * 38} stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity="0.7" />;
      })}
      <circle cx="168" cy="70" r="22" fill="url(#ec-sun)" />
      <g>
        <rect x="120" y="84" width="18" height="42" rx="2" fill={M2} opacity="0.55" />
        <rect x="142" y="62" width="22" height="64" rx="2" fill={M1} opacity="0.7" />
        <rect x="168" y="90" width="16" height="36" rx="2" fill={M3} opacity="0.6" />
        <rect x="188" y="74" width="18" height="52" rx="2" fill={M2} opacity="0.5" />
      </g>
      <g>
        <circle cx="62" cy="74" r="11" fill={BR} />
        <path d="M62 86c-13 0-19 11-19 30h38c0-19-6-30-19-30z" fill={BR} />
        <path d="M62 86c-13 0-19 11-19 30h19z" fill="hsl(var(--text) / 0.12)" />
      </g>
      <line x1="20" y1="126" x2="220" y2="126" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
    </Frame>
  );
}

export function EmptyFeed({ className }: Props) {
  return (
    <Frame id="ef" className={className}>
      <line x1="150" y1="40" x2="150" y2="112" stroke="hsl(var(--text) / 0.4)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="150" cy="46" r="32" fill={M3} opacity="0.75" />
      <circle cx="126" cy="58" r="22" fill={M3} opacity="0.6" />
      <circle cx="174" cy="58" r="22" fill={M3} opacity="0.6" />
      <circle cx="150" cy="40" r="14" fill={M2} opacity="0.7" />
      <rect x="40" y="112" width="160" height="14" rx="4" fill="hsl(var(--surface-muted))" stroke={LINE} strokeWidth="2" />
      <line x1="56" y1="126" x2="56" y2="142" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <line x1="184" y1="126" x2="184" y2="142" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <g><circle cx="80" cy="100" r="8" fill={M1} /><path d="M80 108c-9 0-13 4-13 4h26s-4-4-13-4z" fill={M1} /></g>
      <g><circle cx="106" cy="100" r="8" fill={M2} /><path d="M106 108c-9 0-13 4-13 4h26s-4-4-13-4z" fill={M2} /></g>
    </Frame>
  );
}

export function EmptyInbox({ className }: Props) {
  return (
    <Frame id="ei" className={className}>
      <rect x="44" y="96" width="152" height="42" rx="6" fill="hsl(var(--surface-muted))" stroke={LINE} strokeWidth="2" />
      <rect x="44" y="96" width="152" height="10" rx="6" fill="hsl(var(--text) / 0.06)" />
      <rect x="60" y="72" width="58" height="26" rx="3" fill="hsl(var(--surface))" stroke={LINE} strokeWidth="2" />
      <path d="M60 98l29-15 29 15" fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <g>
        <ellipse cx="164" cy="104" rx="15" ry="4" fill={BR} />
        <path d="M150 104q3 6 14 6t14-6z" fill="hsl(var(--brand-hover))" />
        <circle cx="164" cy="90" r="9" fill="hsl(var(--motif-gold) / 0.45)" />
        <path d="M164 84c2.6 3 3.6 5 3.6 7a3.6 3.6 0 1 1-7.2 0c0-1.7.8-3.2 2.2-4.4-.2 1.5.6 2.4 1.4 2.6z" fill={GOLD} />
      </g>
      <g>
        <circle cx="92" cy="58" r="13" fill={M2} />
        <circle cx="92" cy="58" r="13" fill="hsl(0 0% 100% / 0.15)" />
        <path d="M86 58l4 4 8-9" stroke="hsl(var(--surface))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </Frame>
  );
}

export function EmptyNotifications({ className }: Props) {
  return (
    <Frame id="en" className={className}>
      <line x1="120" y1="26" x2="120" y2="46" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="120" cy="24" r="6" fill="none" stroke={LINE} strokeWidth="3" />
      <path d="M120 46c-3 0-5 3-5 7 0 7-16 13-16 38 0 11 9 15 21 15s21-4 21-15c0-25-16-31-16-38 0-4-2-7-5-7z" fill={M1} opacity="0.9" stroke={BR} strokeWidth="2" />
      <path d="M120 46c-3 0-5 3-5 7 0 7-16 13-16 38 0 11 9 15 21 15z" fill="hsl(0 0% 100% / 0.12)" />
      <ellipse cx="120" cy="106" rx="22" ry="4" fill={BR} opacity="0.4" />
      <circle cx="120" cy="110" r="5" fill={GOLD} />
      <path d="M152 66q12 6 0 14M170 60q18 10 0 26" stroke={SUB} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M88 66q-12 6 0 14M70 60q-18 10 0 26" stroke={SUB} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
    </Frame>
  );
}

export function EmptyClusters({ className }: Props) {
  return (
    <Frame id="ecl" className={className}>
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x = 120 + Math.cos(a) * 40;
        const y = 84 + Math.sin(a) * 40;
        return (
          <g key={i}>
            <path d={`M120 84L${x} ${y}`} stroke={LINE} strokeWidth="1.5" opacity="0.35" />
            <circle cx={x} cy={y} r="8" fill={i % 2 ? M1 : M2} />
            <circle cx={x} cy={y} r="8" fill="hsl(0 0% 100% / 0.12)" />
          </g>
        );
      })}
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <path key={i} d={`M120 84 q ${Math.cos(a) * 6} ${Math.sin(a) * 6} ${Math.cos(a) * 16} ${Math.sin(a) * 16}`} stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      })}
      <circle cx="120" cy="84" r="14" fill={GOLD} />
      <circle cx="120" cy="84" r="14" fill="hsl(0 0% 100% / 0.18)" />
      <circle cx="120" cy="84" r="24" fill="none" stroke={BR} strokeWidth="2" strokeDasharray="3 5" />
    </Frame>
  );
}

export function EmptySearch({ className }: Props) {
  return (
    <Frame id="es" className={className}>
      <path d="M96 36l20 6 14-4 10 12-6 16 8 14-10 20-16 6-8 18-14-10-16 2-6-18-12-10 10-16-6-14 14-10 22-8z" fill="hsl(var(--surface-muted))" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M96 36l20 6 14-4 10 12-6 16-30 4-20-8 12-26z" fill={M2} opacity="0.18" />
      <circle cx="150" cy="96" r="26" fill="hsl(var(--motif-gold) / 0.1)" stroke={BR} strokeWidth="5" />
      <circle cx="150" cy="96" r="26" fill="none" stroke="hsl(0 0% 100% / 0.3)" strokeWidth="1.5" />
      <line x1="170" y1="116" x2="192" y2="138" stroke={BR} strokeWidth="7" strokeLinecap="round" />
      <circle cx="144" cy="90" r="6" fill="hsl(0 0% 100% / 0.4)" />
    </Frame>
  );
}

export function Error404({ className }: Props) {
  return (
    <Frame id="e4" className={className}>
      <line x1="20" y1="128" x2="220" y2="128" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M120 128l-42 -10M120 128l50 -8" stroke={LINE} strokeWidth="2" opacity="0.45" />
      <line x1="168" y1="68" x2="168" y2="128" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M168 74h38l-7 9 7 9h-38z" fill={M1} opacity="0.9" stroke="hsl(var(--text) / 0.3)" strokeWidth="1" />
      <path d="M168 98h-34l7 9-7 9h34z" fill={M2} opacity="0.85" stroke="hsl(var(--text) / 0.3)" strokeWidth="1" />
      <g>
        <circle cx="70" cy="84" r="11" fill={BR} />
        <path d="M70 96c-13 0-19 11-19 32h38c0-21-6-32-19-32z" fill={BR} />
        <path d="M70 96c-13 0-19 11-19 32h19z" fill="hsl(var(--text) / 0.12)" />
      </g>
      <text x="120" y="158" textAnchor="middle" fontSize="20" fontWeight="700" fill={SUB} fontFamily="var(--font-baloo)">404</text>
    </Frame>
  );
}

export function Error500({ className }: Props) {
  return (
    <Frame id="e5" className={className}>
      <defs>
        <linearGradient id="e5-k" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={M1} />
          <stop offset="100%" stopColor={M2} />
        </linearGradient>
      </defs>
      <g transform="rotate(14 120 72)">
        <path d="M120 36l30 32-30 32-30-32z" fill="url(#e5-k)" />
        <path d="M120 36v64M90 68h60" stroke="hsl(var(--surface))" strokeWidth="2" opacity="0.7" />
        <path d="M120 36l30 32-30 8-30-8z" fill="hsl(0 0% 100% / 0.18)" />
        <path d="M120 100l-4 12 6 6-6 6 6 8" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M152 122q-22 6 -44 -2t-54 8" stroke={LINE} strokeWidth="2" strokeDasharray="2 6" fill="none" strokeLinecap="round" opacity="0.6" />
    </Frame>
  );
}
