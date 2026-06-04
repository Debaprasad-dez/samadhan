import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNowStrict } from "date-fns";

/** Conditional + conflict-safe className concatenation (used by shadcn + bespoke). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "5 hours ago" style relative time. */
export function formatRelative(date: Date | string): string {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

/** Absolute time localised to IST, e.g. "12 Mar 2026, 2:34 pm IST" (§5.1.3). */
export function formatIST(date: Date | string): string {
  const s = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
  return `${s} IST`;
}

/** Title-case a CONSTANT_CASE code, e.g. "PUBLIC_WORKS" → "Public Works". */
export function humanizeCode(code: string): string {
  return code
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Deterministic avatar background from a name (§7.4.5 / §7.6) — picks one of the
 * active theme's motif colours so avatars recolour per theme. Returns a CSS
 * `hsl(var(--motif-N))` string for use as an inline background.
 */
export function avatarColor(name: string): string {
  const motifs = ["--motif-1", "--motif-2", "--motif-3", "--motif-gold"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(var(${motifs[Math.abs(hash) % motifs.length]}))`;
}

/** Initials from a display name. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Clamp helper. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
