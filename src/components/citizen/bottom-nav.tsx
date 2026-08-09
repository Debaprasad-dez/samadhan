"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const IC = {
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" />,
  feed: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M7 9h6M7 13h10M7 16h7" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" /></>,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

const NAV = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/feed", label: "Feed", icon: "feed" },
  { href: "/cases", label: "Cases", icon: "list" },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

/**
 * Tabs replace rather than push, so the back gesture unwinds to where the
 * session began instead of retracing every sideways step — the same contract
 * SwipeNav honours.
 */
function Tab({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: keyof typeof IC;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      replace
      className={`nb${active ? " on" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={() => navigator.vibrate?.(8)}
    >
      <Icon d={icon} />
      <b>{label}</b>
    </Link>
  );
}

/** How far you must move before the bar reacts, so a thumb resting still. */
const JITTER = 6;
/** The bar stays put near the top of a page — hiding there reads as a glitch. */
const FLOOR = 90;

/**
 * The one bottom nav, mounted in the citizen layout so it survives navigation
 * and never blinks out while a route loads. It slides away as you read down a
 * page and returns the moment you scroll back up.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const dy = y - last;
      if (Math.abs(dy) < JITTER) return;
      setHidden(dy > 0 && y > FLOOR);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Every route change starts from the top of its own page.
  useEffect(() => setHidden(false), [pathname]);

  // The wizard owns the bottom of the screen with its own step bar.
  if (pathname === "/file") return null;

  // Routes reached from a tab rather than being one, so the tab they came
  // from stays lit while you are down there.
  const parent =
    pathname.startsWith("/ward") ? "/feed" : pathname === "/notifications" ? "/" : pathname;
  const isActive = (href: string) =>
    href === "/" ? parent === "/" : parent.startsWith(href);

  return (
    <div className="chome navonly">
      <nav className={`nav${hidden ? " down" : ""}`} aria-label="Primary">
        {NAV.slice(0, 2).map((n) => (
          <Tab key={n.href} {...n} active={isActive(n.href)} />
        ))}
        {/* Filing is a task, not a tab: it pushes, so back returns you here. */}
        <Link href="/file" className="nb fab" aria-label="File a complaint">
          <div className="f"><Icon d="plus" sw={2.2} /></div>
        </Link>
        {NAV.slice(2).map((n) => (
          <Tab key={n.href} {...n} active={isActive(n.href)} />
        ))}
      </nav>
    </div>
  );
}
