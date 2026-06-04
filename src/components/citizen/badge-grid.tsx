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
import { BADGES } from "@/lib/seed-data";
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

export function BadgeGrid({ earned }: { earned: string[] }) {
  const set = new Set(earned);
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
      {BADGES.map((b) => {
        const Icon = ICONS[b.iconKey] ?? BadgeCheck;
        const has = set.has(b.id);
        return (
          <div
            key={b.id}
            title={b.description}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center",
              has ? "bg-brand-soft border-brand/30" : "bg-surface-muted opacity-60",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                has ? "bg-brand text-brand-foreground" : "bg-background text-muted-foreground",
              )}
            >
              {has ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
            </span>
            <span className="text-xs font-medium leading-tight">{b.name}</span>
          </div>
        );
      })}
    </div>
  );
}
