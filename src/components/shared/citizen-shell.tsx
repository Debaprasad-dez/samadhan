"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, PlusCircle, FileText, User } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AmbientLamp } from "@/components/shared/ambient-lamp";
import { NotificationBell } from "@/components/shared/notification-bell";
import type { SessionUser } from "@/types";

const NAV = [
  { href: "/", label: "nav.home", icon: Home },
  { href: "/feed", label: "nav.feed", icon: Newspaper },
  { href: "/file", label: "nav.file", icon: PlusCircle, primary: true },
  { href: "/cases", label: "nav.cases", icon: FileText },
  { href: "/profile", label: "nav.profile", icon: User },
];

export function CitizenShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useT();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Home, feed, cases and profile ship the design's own full-bleed layout (top
  // bar, hero, bottom nav), so the shell steps aside on those routes.
  if (
    pathname === "/" ||
    pathname === "/feed" ||
    pathname === "/file" ||
    pathname.startsWith("/cases") ||
    pathname.startsWith("/ward") ||
    pathname === "/notifications" ||
    pathname === "/profile"
  )
    return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/80 border-border sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md md:h-16 md:px-6">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(n.label)}
                {active && (
                  <span className="bg-brand absolute inset-x-3 -bottom-[7px] h-0.5 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1">
          <AmbientLamp className="hidden sm:inline-flex" />
          <NotificationBell />
          <ThemeToggle />
          <span className="text-muted-foreground hidden text-sm sm:inline">
            {user.name}
          </span>
          <Link
            href="/profile"
            aria-label={t("nav.profile")}
            className="bg-brand-soft text-brand ring-brand/0 hover:ring-brand/40 ml-1 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-2 transition focus-visible:ring-brand"
          >
            {initials(user.name)}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-10">
        {children}
      </main>

      {/* mobile bottom nav (§6.3.1, §7.8) — raised centre File action */}
      <nav
        className="bg-surface/95 border-border fixed inset-x-0 bottom-0 z-20 flex h-16 items-end justify-around border-t px-1 pb-1.5 backdrop-blur-md md:hidden"
        aria-label="Primary mobile"
      >
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.href);

          if (n.primary) {
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-label={t(n.label)}
                className="text-brand-foreground ring-surface -mt-7 flex h-14 w-14 flex-col items-center justify-center rounded-full ring-4 transition-all duration-150 active:translate-y-0.5"
                style={{
                  background:
                    "radial-gradient(120% 120% at 50% 14%, hsl(var(--brand)) 0%, hsl(var(--brand-hover)) 100%)",
                  boxShadow:
                    "0 10px 22px -6px hsl(var(--brand) / 0.55), 0 4px 8px -2px rgba(0,0,0,0.28), inset 0 2px 1px rgba(255,255,255,0.5), inset 0 -3px 5px rgba(0,0,0,0.22)",
                }}
              >
                <Icon className="h-6 w-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" />
              </Link>
            );
          }

          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "relative flex min-w-[44px] flex-col items-center gap-0.5 pb-1 pt-2 text-[11px]",
                active ? "text-brand" : "text-muted-foreground",
              )}
            >
              {active && (
                <span className="bg-brand absolute top-0.5 h-1 w-1 rounded-full" />
              )}
              <Icon className="h-5 w-5" />
              <span>{t(n.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
