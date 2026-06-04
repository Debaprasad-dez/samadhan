"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Boxes,
  BarChart3,
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AmbientLamp } from "@/components/shared/ambient-lamp";
import { LogoutButton } from "@/components/shared/logout-button";
import type { SessionUser } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}
interface NavGroup {
  label?: string;
  items: NavItem[];
}

// Nav configs live inside this client module so the lucide icon *functions*
// never cross the server→client boundary (RSC cannot serialize functions).
const NAV: Record<"officer" | "admin", NavGroup[]> = {
  officer: [
    {
      items: [
        { href: "/inbox", label: "Inbox", icon: Inbox },
        { href: "/clusters", label: "Clusters", icon: Boxes },
        { href: "/metrics", label: "My metrics", icon: BarChart3 },
      ],
    },
  ],
  admin: [
    {
      label: "Operations",
      items: [
        { href: "/overview", label: "Overview", icon: LayoutDashboard },
        { href: "/officers", label: "Officers", icon: Users },
      ],
    },
    {
      label: "Insights",
      items: [
        { href: "/trends", label: "Trends", icon: TrendingUp },
        { href: "/policy", label: "Policy", icon: FileText },
      ],
    },
  ],
};

/** Shared sidebar layout for officer + admin shells (§6.3.2, §6.3.3). */
export function SidebarShell({
  user,
  variant,
  children,
}: {
  user: SessionUser;
  variant: "officer" | "admin";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const groups = NAV[variant];
  const homeHref = groups[0]?.items[0]?.href ?? "/";
  const flat = groups.flatMap((g) => g.items);

  return (
    <div className="flex min-h-dvh">
      <aside className="bg-surface hidden w-60 shrink-0 flex-col border-r lg:flex">
        <div className="flex h-16 items-center px-5">
          <Brand href={homeHref} />
        </div>
        <nav className="flex-1 space-y-4 px-3 py-2" aria-label="Primary">
          {groups.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.label && (
                <p className="text-muted-foreground px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              {group.items.map((it) => {
                const Icon = it.icon;
                const active = pathname.startsWith(it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-soft text-brand"
                        : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="bg-brand absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full" />
                    )}
                    <Icon className="h-[18px] w-[18px]" />
                    {it.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="text-muted-foreground border-t p-4 text-xs">
          Samadhan v1.0 · Mumbai
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 border-border sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md md:px-6">
          <div className="lg:hidden">
            <Brand href={homeHref} />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <AmbientLamp className="hidden sm:inline-flex" />
            <ThemeToggle />
            <span
              className="bg-brand-soft text-brand ring-brand/40 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1"
              aria-hidden
            >
              {initials(user.name)}
            </span>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

        {/* mobile horizontal nav */}
        <nav
          className="bg-background flex items-center gap-1 overflow-x-auto border-t px-2 py-2 lg:hidden"
          aria-label="Primary mobile"
        >
          {flat.map((it) => {
            const Icon = it.icon;
            const active = pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm",
                  active ? "bg-brand-soft text-brand" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
