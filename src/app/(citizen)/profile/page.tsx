import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { tierForScore } from "@/lib/reputation";
import { REPUTATION_TIERS } from "@/types";
import { BADGES } from "@/lib/seed-data";
import { streakEmblem } from "@/lib/art/ward-island";
import { ProfileHero } from "@/components/citizen/profile-hero";
import { ThemeCards } from "@/components/citizen/theme-cards";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { LogoutButton } from "@/components/shared/logout-button";

// Inline icons — the mockup's symbols.
const IC = {
  bell: <><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" />,
  feed: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M7 9h6M7 13h10M7 16h7" /></>,
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" /></>,
  // badge glyphs
  star: <path d="m12 3.5 2.7 5.6 6.1.85-4.4 4.3 1.05 6.1L12 17.5l-5.45 2.85 1.05-6.1-4.4-4.3 6.1-.85L12 3.5Z" />,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  users: <><circle cx="9" cy="8.5" r="3.4" /><path d="M2.8 20a6.4 6.4 0 0 1 12.4 0M16.5 5.6a3.4 3.4 0 0 1 0 6.6M17.5 20a6.5 6.5 0 0 0-2-4.4" /></>,
  flame: <path d="M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5s.5 2 2 2c0-3.5 2-6 2-8Z" />,
  shield: <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" />,
  pin: <><path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.4" /></>,
  doc: <><path d="M6.5 3.5h7L18 8v12a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" /><path d="M13.5 3.5V8H18" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5Z" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  crown: <path d="M4 18h16M4 18 3 7l5 4 4-6 4 6 5-4-1 11" />,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

// Seed badge iconKey → the mockup's glyph set.
const BADGE_ICON: Record<string, keyof typeof IC> = {
  mic: "star",
  "badge-check": "chk2",
  handshake: "users",
  eye: "eye",
  calendar: "flame",
  "calendar-days": "shield",
  search: "doc",
  "git-fork": "pin",
  crown: "crown",
};

export default async function ProfilePage() {
  const session = await requireRole(["CITIZEN"]);

  const [user, unread, filed, resolvedCases, openCases] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
      include: { badges: true, _count: { select: { cases: true, cosigns: true } } },
    }),
    db.notification.count({ where: { userId: session.id, readAt: null } }),
    db.case.count({ where: { filedById: session.id } }),
    db.case.findMany({
      where: { filedById: session.id, status: { in: ["RESOLVED", "CLOSED"] } },
      select: { createdAt: true, resolvedAt: true },
    }),
    db.case.findMany({
      where: { filedById: session.id, status: { notIn: ["RESOLVED", "CLOSED"] } },
      select: { slaDueAt: true },
    }),
  ]);
  if (!user) return null;

  const earned = new Set(user.badges.map((b) => b.badgeId));
  const tier = tierForScore(user.reputation);
  const tierIdx = REPUTATION_TIERS.findIndex((x) => user.reputation >= x.min && user.reputation <= x.max);
  const cur = REPUTATION_TIERS[tierIdx] ?? REPUTATION_TIERS[0];
  const next = REPUTATION_TIERS[tierIdx + 1];
  const span = cur.max - cur.min || 1;
  const tierPct = next ? Math.min(100, Math.round(((user.reputation - cur.min) / span) * 100)) : 100;

  const fixes = resolvedCases.length;
  const active = openCases.length;
  const overdue = openCases.filter((c) => c.slaDueAt.getTime() < Date.now()).length;
  const closeDays = resolvedCases
    .filter((c) => c.resolvedAt)
    .map((c) => (c.resolvedAt!.getTime() - c.createdAt.getTime()) / 86_400_000)
    .sort((a, b) => a - b);
  const medianClose = closeDays.length ? closeDays[Math.floor(closeDays.length / 2)] : 0;
  const joined = user.createdAt.toLocaleString("en", { month: "long", year: "numeric" });
  const earnedCount = BADGES.filter((b) => earned.has(b.id)).length;

  // Spell out the headline count.
  const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  const headline = fixes <= 12 ? WORDS[fixes] : String(fixes);

  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <header className="top">
          <div className="row">
            <div>
              <div className="greet">{user.name}</div>
              <div className="ward">
                Ward {user.wardCode ?? "—"} · member since {user.createdAt.getFullYear()}
              </div>
            </div>
            <Link href="/notifications" className="bell" aria-label={`${unread} notifications`}>
              <Icon d="bell" />
              {unread > 0 && <b>{unread}</b>}
            </Link>
          </div>
        </header>

        <ProfileHero fixes={fixes} tier={tierPct} active={active} />

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">Tier {tierIdx + 1} · {tier}</div>
            <h1 className="dspl">{headline} thing{fixes === 1 ? "" : "s"} fixed</h1>
            <p className="lede">
              Each marker on the plinth is a complaint you filed or co-signed that
              a neighbour <b>confirmed resolved</b>. Filing alone earns nothing —
              by design.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Confirmed</div>
              <div className="sv">{fixes}</div>
              <div className="sd">fixes</div>
            </div>
            <div>
              <div className="sk">Co-signs</div>
              <div className="sv">{user._count.cosigns}</div>
              <div className="sd">all valid</div>
            </div>
            <div>
              <div className="sk">Streak</div>
              <div className="sv">{user.streakDays}<small>d</small></div>
              <div className="sd">current</div>
            </div>
          </div>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Progress to {next ? next.name : "the top"}</b>
              <span>{user.reputation.toLocaleString()} pts</span>
            </div>
            <div className="trk" style={{ marginTop: 15 }}>
              <i data-w={tierPct} style={{ background: "var(--gold)" }} />
            </div>
            <div className="cap">
              <span><b>Tier {tierIdx + 1}</b> · {tier}</span>
              <span><b>{next ? next.min - user.reputation : 0}</b> to go</span>
            </div>
            <div className="note">
              The gold ring around the plinth is this same number. Points accrue
              only when a case is <b>confirmed resolved by a citizen</b>, so the
              tier cannot be farmed by filing more.
            </div>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Badges</b><span>{earnedCount} of {BADGES.length}</span></div>
            <div className="badges">
              {BADGES.map((b) => (
                <div key={b.id} className={`badge${earned.has(b.id) ? "" : " off"}`} title={b.description}>
                  <Icon d={BADGE_ICON[b.iconKey] ?? "star"} />
                  <b>{b.name}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Your record</b><span>All time</span></div>
            <div className="mrow">
              <div><div className="t2">Complaints filed</div><div className="s3">Since {joined}</div></div>
              <div className="v2">{filed}</div>
            </div>
            <div className="mrow">
              <div><div className="t2">Confirmed resolved</div><div className="s3">You closed the loop</div></div>
              <div className="v2">{fixes}</div>
            </div>
            <div className="mrow">
              <div>
                <div className="t2">Still open</div>
                <div className="s3">{overdue} past its charter limit</div>
              </div>
              <div className="v2">{active}</div>
            </div>
            <div className="mrow">
              <div><div className="t2">Median time to close</div><div className="s3">Across your closed cases</div></div>
              <div className="v2">{medianClose.toFixed(1)}d</div>
            </div>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Appearance</b><span>4 themes</span></div>
            <ThemeCards />
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Streak</b><span>{user.streakDays} days</span></div>
            <div className="standing">
              <div>
                <div dangerouslySetInnerHTML={{ __html: streakEmblem(user.streakDays, 30, 58) }} />
                <div style={{ fontSize: "9.5px", color: "var(--muted)", marginTop: 4, whiteSpace: "nowrap" }}>
                  <b style={{ color: "var(--ink)" }}>{user.streakDays}</b> days
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t2" style={{ fontSize: "14px", fontWeight: 600 }}>
                  {user.streakDays} day streak
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: 3, lineHeight: 1.5 }}>
                  Counted from confirming fixes and co-signing — not from opening
                  the app.
                </div>
              </div>
            </div>
            <LogoutButton plain className="btn s w" />

          </section>
        </div>
      </div>

      <nav className="nav">
        <Link href="/" className="nb"><Icon d="home" /><b>Home</b></Link>
        <Link href="/feed" className="nb"><Icon d="feed" /><b>Feed</b></Link>
        <Link href="/file" className="nb fab" aria-label="File a complaint">
          <div className="f"><Icon d="plus" sw={2.2} /></div>
        </Link>
        <Link href="/cases" className="nb"><Icon d="list" /><b>Cases</b></Link>
        <Link href="/profile" className="nb on"><Icon d="user" /><b>Profile</b></Link>
      </nav>
    </div>
  );
}
