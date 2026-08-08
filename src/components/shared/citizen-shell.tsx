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

      {/* The mobile bottom nav is mounted once in the citizen layout, so it
          survives navigation instead of remounting per page. */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-10">
        {children}
      </main>
    </div>
  );
}
