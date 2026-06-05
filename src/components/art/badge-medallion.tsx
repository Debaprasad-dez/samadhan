import {
  Mic,
  BadgeCheck,
  Handshake,
  Eye,
  Calendar,
  CalendarDays,
  Search,
  GitFork,
  Crown,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  mic: Mic,
  "badge-check": BadgeCheck,
  handshake: Handshake,
  eye: Eye,
  calendar: Calendar,
  "calendar-days": CalendarDays,
  search: Search,
  "git-fork": GitFork,
  crown: Crown,
};

/**
 * A crafted collectible medallion (design §5.2): a beaded gold rim around a
 * radial-gradient disc with a ribbon banner, an inner glyph and a top highlight.
 * Earned = full colour + gold; locked = monochrome + lock. Token-coloured.
 */
export function BadgeMedallion({
  iconKey,
  earned,
  className,
}: {
  iconKey: string;
  earned: boolean;
  className?: string;
}) {
  const Icon = ICONS[iconKey] ?? BadgeCheck;
  const uid = `bm-${iconKey}`;
  const rim = earned ? "hsl(var(--motif-gold))" : "hsl(var(--border-strong))";

  return (
    <div className={cn("relative", className)} style={{ aspectRatio: "1 / 1.12" }}>
      <svg viewBox="0 0 64 72" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={`${uid}-disc`} cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor={earned ? "hsl(var(--brand-soft))" : "hsl(var(--surface))"} />
            <stop offset="100%" stopColor={earned ? "hsl(var(--brand) / 0.22)" : "hsl(var(--surface-muted))"} />
          </radialGradient>
          <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={rim} />
            <stop offset="100%" stopColor={earned ? "hsl(var(--brand))" : "hsl(var(--border))"} />
          </linearGradient>
        </defs>

        {/* ribbon banner */}
        <path d="M22 50l-6 18 10-5 6 6 6-6 10 5-6-18z" fill={earned ? "hsl(var(--motif-1))" : "hsl(var(--surface-muted))"} stroke={rim} strokeWidth="1" />

        {/* beaded rim */}
        {[...Array(20)].map((_, i) => {
          const a = (i / 20) * Math.PI * 2;
          return <circle key={i} cx={32 + Math.cos(a) * 29} cy={30 + Math.sin(a) * 29} r="2.4" fill={rim} opacity={earned ? 0.95 : 0.5} />;
        })}
        {/* rim ring + disc */}
        <circle cx="32" cy="30" r="27" fill={`url(#${uid}-rim)`} />
        <circle cx="32" cy="30" r="23" fill={`url(#${uid}-disc)`} stroke={rim} strokeWidth="1" />
        {/* inner guilloché ring */}
        <circle cx="32" cy="30" r="19" fill="none" stroke={rim} strokeWidth="0.8" opacity="0.5" strokeDasharray="2 3" />
        {/* top highlight */}
        <path d="M16 22a18 18 0 0 1 32 0" fill="none" stroke="hsl(0 0% 100% / 0.5)" strokeWidth="2" opacity={earned ? 0.5 : 0.2} />
      </svg>
      <span className="pointer-events-none absolute inset-x-0 top-0 flex h-[83%] items-center justify-center">
        {earned ? (
          <Icon className="text-brand h-6 w-6" strokeWidth={2} />
        ) : (
          <Lock className="text-muted-foreground h-5 w-5" />
        )}
      </span>
    </div>
  );
}
