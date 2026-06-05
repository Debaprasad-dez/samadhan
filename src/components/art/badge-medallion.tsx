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

// A crafted collectible medallion (design §5.2 badges): a scalloped gold rim
// around a themed disc, with the badge glyph. Earned = full colour; locked = dim.
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
  const rim = earned ? "hsl(var(--motif-gold))" : "hsl(var(--border-strong))";
  const disc = earned ? "hsl(var(--brand-soft))" : "hsl(var(--surface-muted))";

  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
        {[...Array(18)].map((_, i) => {
          const a = (i / 18) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={32 + Math.cos(a) * 28}
              cy={32 + Math.sin(a) * 28}
              r="3"
              fill={rim}
              opacity={earned ? 0.9 : 0.5}
            />
          );
        })}
        <circle cx="32" cy="32" r="26" fill={disc} stroke={rim} strokeWidth="2" />
        <circle cx="32" cy="32" r="22" fill="none" stroke={rim} strokeWidth="1" opacity="0.6" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {earned ? (
          <Icon className="text-brand h-6 w-6" />
        ) : (
          <Lock className="text-muted-foreground h-5 w-5" />
        )}
      </span>
    </div>
  );
}
