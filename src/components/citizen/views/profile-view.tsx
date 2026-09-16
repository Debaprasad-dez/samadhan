import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tierForScore } from "@/lib/reputation";
import { REPUTATION_TIERS, type SessionUser } from "@/types";
import { BADGES } from "@/lib/seed-data";
import { streakEmblem } from "@/lib/art/ward-island";
import { ProfileHero } from "@/components/citizen/profile-hero";
import { ThemeCards } from "@/components/citizen/theme-cards";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { LogoutButton } from "@/components/shared/logout-button";
import { Slot } from "@/components/citizen/slot";
import { CitizenTop, HeroPlaceholder, Sk, SkIn } from "@/components/citizen/skeletons";
import { FullName, WardCode } from "@/components/citizen/session-bits";

// Inline icons — the mockup's symbols.
const IC = {
  star: <path d="m12 3.5 2.7 5.6 6.1.85-4.4 4.3 1.05 6.1L12 17.5l-5.45 2.85 1.05-6.1-4.4-4.3 6.1-.85L12 3.5Z" />,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  users: <><circle cx="9" cy="8.5" r="3.4" /><path d="M2.8 20a6.4 6.4 0 0 1 12.4 0M16.5 5.6a3.4 3.4 0 0 1 0 6.6M17.5 20a6.5 6.5 0 0 0-2-4.4" /></>,
  flame: <path d="M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5s.5 2 2 2c0-3.5 2-6 2-8Z" />,
  shield: <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" />,
  pin: <><path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.4" /></>,
  doc: <><path d="M6.5 3.5h7L18 8v12a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" /><path d="M13.5 3.5V8H18" /></>,
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

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** Everything on Profile that has to come from the database, in one round. */
export async function loadProfile(session: SessionUser) {
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
  if (!user) redirect("/login");

  const earned = new Set(user.badges.map((b) => b.badgeId));
  const tierIdx = REPUTATION_TIERS.findIndex((x) => user.reputation >= x.min && user.reputation <= x.max);
  const cur = REPUTATION_TIERS[tierIdx] ?? REPUTATION_TIERS[0];
  const next = REPUTATION_TIERS[tierIdx + 1];
  const span = cur.max - cur.min || 1;
  const fixes = resolvedCases.length;
  const closeDays = resolvedCases
    .filter((c) => c.resolvedAt)
    .map((c) => (c.resolvedAt!.getTime() - c.createdAt.getTime()) / 86_400_000)
    .sort((a, b) => a - b);

  return {
    unread,
    filed,
    fixes,
    active: openCases.length,
    overdue: openCases.filter((c) => c.slaDueAt.getTime() < Date.now()).length,
    medianClose: closeDays.length ? closeDays[Math.floor(closeDays.length / 2)] : 0,
    cosigns: user._count.cosigns,
    streakDays: user.streakDays,
    reputation: user.reputation,
    memberYear: user.createdAt.getFullYear(),
    joined: user.createdAt.toLocaleString("en", { month: "long", year: "numeric" }),
    earned,
    earnedCount: BADGES.filter((b) => earned.has(b.id)).length,
    tier: tierForScore(user.reputation),
    tierIdx,
    next,
    tierPct: next ? Math.min(100, Math.round(((user.reputation - cur.min) / span) * 100)) : 100,
    headline: fixes <= 12 ? WORDS[fixes] : String(fixes),
  };
}

export type ProfileData = Awaited<ReturnType<typeof loadProfile>>;

/** The citizen's profile. Rendered from loading.tsx with `data={null}` — see Slot. */
export function ProfileView({ data }: { data: Promise<ProfileData> | null }) {
  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <CitizenTop
          title={<FullName />}
          sub={<>Ward <WardCode /> · member since <Slot data={data} fallback={<SkIn w="4ch" />}>{(d) => d.memberYear}</Slot></>}
          unread={<Slot data={data} fallback={null}>{(d) => d.unread > 0 && <b>{d.unread}</b>}</Slot>}
        />

        <Slot data={data} fallback={<HeroPlaceholder h={310} />}>
          {(d) => <ProfileHero fixes={d.fixes} tier={d.tierPct} active={d.active} />}
        </Slot>

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">
              <Slot data={data} fallback={<Sk w="36%" />}>{(d) => <>Tier {d.tierIdx + 1} · {d.tier}</>}</Slot>
            </div>
            <h1 className="dspl">
              <Slot data={data} fallback={<Sk w="66%" />}>
                {(d) => <>{d.headline} thing{d.fixes === 1 ? "" : "s"} fixed</>}
              </Slot>
            </h1>
            <p className="lede">
              Each marker on the plinth is a complaint you filed or co-signed that
              a neighbour <b>confirmed resolved</b>. Filing alone earns nothing —
              by design.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Confirmed</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.fixes}</Slot></div>
              <div className="sd">fixes</div>
            </div>
            <div>
              <div className="sk">Co-signs</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.cosigns}</Slot></div>
              <div className="sd">all valid</div>
            </div>
            <div>
              <div className="sk">Streak</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2.6ch" />}>{(d) => <>{d.streakDays}<small>d</small></>}</Slot></div>
              <div className="sd">current</div>
            </div>
          </div>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Progress to <Slot data={data} fallback={<SkIn w="5ch" />}>{(d) => (d.next ? d.next.name : "the top")}</Slot></b>
              <span><Slot data={data} fallback={<SkIn w="4ch" />}>{(d) => d.reputation.toLocaleString()}</Slot> pts</span>
            </div>
            <div className="trk" style={{ marginTop: 15 }}>
              <Slot data={data} fallback={null}>{(d) => <i data-w={d.tierPct} style={{ background: "var(--gold)" }} />}</Slot>
            </div>
            <div className="cap">
              <Slot data={data} fallback={<><Sk w="32%" /><Sk w="18%" /></>}>
                {(d) => (
                  <>
                    <span><b>Tier {d.tierIdx + 1}</b> · {d.tier}</span>
                    <span><b>{d.next ? d.next.min - d.reputation : 0}</b> to go</span>
                  </>
                )}
              </Slot>
            </div>
            <div className="note">
              The gold ring around the plinth is this same number. Points accrue
              only when a case is <b>confirmed resolved by a citizen</b>, so the
              tier cannot be farmed by filing more.
            </div>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Badges</b>
              <span><Slot data={data} fallback={<SkIn w="1ch" />}>{(d) => d.earnedCount}</Slot> of {BADGES.length}</span>
            </div>
            <Slot
              data={data}
              fallback={
                // The same grid, every badge dimmed: shape is known, only which are earned waits.
                <div className="badges" aria-busy aria-label="Loading">
                  {BADGES.map((b) => (
                    <div key={b.id} className="badge off">
                      <Icon d={BADGE_ICON[b.iconKey] ?? "star"} />
                      <b>{b.name}</b>
                    </div>
                  ))}
                </div>
              }
            >
              {(d) => (
                <div className="badges">
                  {BADGES.map((b) => (
                    <div key={b.id} className={`badge${d.earned.has(b.id) ? "" : " off"}`} title={b.description}>
                      <Icon d={BADGE_ICON[b.iconKey] ?? "star"} />
                      <b>{b.name}</b>
                    </div>
                  ))}
                </div>
              )}
            </Slot>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Your record</b><span>All time</span></div>
            <div className="mrow">
              <div>
                <div className="t2">Complaints filed</div>
                <div className="s3">Since <Slot data={data} fallback={<SkIn w="6em" />}>{(d) => d.joined}</Slot></div>
              </div>
              <div className="v2"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.filed}</Slot></div>
            </div>
            <div className="mrow">
              <div><div className="t2">Confirmed resolved</div><div className="s3">You closed the loop</div></div>
              <div className="v2"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.fixes}</Slot></div>
            </div>
            <div className="mrow">
              <div>
                <div className="t2">Still open</div>
                <div className="s3"><Slot data={data} fallback={<SkIn w="1ch" />}>{(d) => d.overdue}</Slot> past its charter limit</div>
              </div>
              <div className="v2"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.active}</Slot></div>
            </div>
            <div className="mrow">
              <div><div className="t2">Median time to close</div><div className="s3">Across your closed cases</div></div>
              <div className="v2"><Slot data={data} fallback={<Sk w="3ch" />}>{(d) => <>{d.medianClose.toFixed(1)}d</>}</Slot></div>
            </div>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Appearance</b><span>4 themes</span></div>
            <ThemeCards />
          </section>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Streak</b>
              <span><Slot data={data} fallback={<SkIn w="1.5ch" />}>{(d) => d.streakDays}</Slot> days</span>
            </div>
            <div className="standing">
              <div>
                <Slot data={data} fallback={<div style={{ width: 58, height: 58 }} />}>
                  {(d) => <div dangerouslySetInnerHTML={{ __html: streakEmblem(d.streakDays, 30, 58) }} />}
                </Slot>
                <div style={{ fontSize: "9.5px", color: "var(--muted)", marginTop: 4, whiteSpace: "nowrap" }}>
                  <b style={{ color: "var(--ink)" }}><Slot data={data} fallback={<SkIn w="1.5ch" />}>{(d) => d.streakDays}</Slot></b> days
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t2" style={{ fontSize: "14px", fontWeight: 600 }}>
                  <Slot data={data} fallback={<Sk w="44%" />}>{(d) => <>{d.streakDays} day streak</>}</Slot>
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
    </div>
  );
}
