import Link from "next/link";
import type { ReactNode } from "react";
import { HomeReveal } from "@/components/citizen/home-reveal";

/*
 * Skeleton pieces for the citizen app. Each one is built from the real
 * container it stands in for (.case, .stats, .hero…), so the content that
 * replaces it lands in exactly the same box. Colours come from citizen-
 * skeleton.css, which only uses `.chome` tokens.
 */

/** A bar standing in for a line of text; height follows the font size. */
export function Sk({ w = "60%" }: { w?: string }) {
  return <span className="skel" style={{ width: w }} aria-hidden />;
}

/** A single value inside real copy. */
export function SkIn({ w }: { w?: string }) {
  return <span className="skel inl" style={w ? { width: w } : undefined} aria-hidden />;
}

/** The hero's sky at the scene's exact aspect ratio (every scene is 430 wide). */
export function HeroPlaceholder({ h }: { h: number }) {
  return (
    <div className="hero ph" style={{ aspectRatio: `430 / ${h}` }} aria-hidden>
      <div className="fade" />
    </div>
  );
}

/** Rows in the shape of an SLA case card. */
export function CaseRowsSkeleton({ n = 3, className = "case" }: { n?: number; className?: string }) {
  return (
    <div aria-busy aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={className}>
          <div className="body2" style={{ flex: 1 }}>
            <div className="hd">
              <div style={{ flex: 1 }}>
                <div className="t"><Sk w="66%" /></div>
                <div className="m"><Sk w="40%" /></div>
              </div>
            </div>
            <div className="trk" />
            <div className="cap">
              <Sk w="28%" />
              <Sk w="38%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** The top bar every tab shares. `unread` is a slot for the bell's badge. */
export function CitizenTop({
  title,
  sub,
  unread,
}: {
  title: ReactNode;
  sub: ReactNode;
  unread: ReactNode;
}) {
  return (
    <header className="top">
      <div className="row">
        <div style={{ minWidth: 0 }}>
          <div className="greet">{title}</div>
          <div className="ward">{sub}</div>
        </div>
        <Link href="/notifications" className="bell" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          {unread}
        </Link>
      </div>
    </header>
  );
}

/**
 * The loading state for citizen screens that are not tabs (a case, the ward,
 * notifications). Painted from `.chome` tokens, so it matches the page in every
 * theme instead of borrowing the Tailwind layer's light/dark.
 */
export function ChomeSkeleton() {
  return (
    <div className="chome" aria-busy aria-label="Loading">
      <HomeReveal />
      <div className="shell">
        <header className="top">
          <div className="row">
            <div style={{ flex: 1 }}>
              <div className="greet"><Sk w="46%" /></div>
              <div className="ward"><Sk w="64%" /></div>
            </div>
            <span className="bell" />
          </div>
        </header>
        <HeroPlaceholder h={310} />
        <div className="wrap">
          <div className="eyebrow"><Sk w="38%" /></div>
          <h1 className="dspl"><Sk w="72%" /></h1>
          <p className="lede"><Sk w="100%" /><Sk w="84%" /></p>
          <section>
            <div className="sh"><b><Sk w="7em" /></b></div>
            <CaseRowsSkeleton n={3} />
          </section>
        </div>
      </div>
    </div>
  );
}
