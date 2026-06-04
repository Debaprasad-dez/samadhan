"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, PlusCircle, FileText, User } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { LogoutButton } from "@/components/shared/logout-button";
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

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/95 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:h-16 md:px-6">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(n.href) && "text-foreground",
              )}
            >
              {t(n.label)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
          <span className="text-muted-foreground hidden text-sm sm:inline">
            {user.name}
          </span>
          <span
            className="bg-brand-soft text-brand flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
            aria-hidden
          >
            {initials(user.name)}
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10">
        {children}
      </main>

      {/* mobile bottom nav (§6.3.1) */}
      <nav
        className="bg-background fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t md:hidden"
        aria-label="Primary mobile"
      >
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex min-w-[44px] flex-col items-center gap-0.5 text-xs",
                active ? "text-brand" : "text-muted-foreground",
              )}
            >
              <Icon className={cn(n.primary && "h-7 w-7")} />
              <span>{t(n.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
