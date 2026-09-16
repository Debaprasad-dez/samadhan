import Link from "next/link";
import { db } from "@/lib/db";
import { tierForScore } from "@/lib/reputation";
import { REPUTATION_TIERS, type SessionUser } from "@/types";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { ridgeline, streakEmblem, heatCells } from "@/lib/art/ward-island";
import { HomeHero } from "@/components/citizen/home-hero";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { VoiceMicButton } from "@/components/citizen/voice-capture";
import { Slot } from "@/components/citizen/slot";
import { CitizenTop, HeroPlaceholder, CaseRowsSkeleton, Sk, SkIn } from "@/components/citizen/skeletons";
import { FirstName, Initials, WardName } from "@/components/citizen/session-bits";

// Inline icon set — the mockup's symbols, drawn directly.
const IC = {
  plus: <path d="M12 5v14M5 12h14" />,
  clk: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  drop: <path d="M12 3.6c2.9 3.6 5.4 6.5 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-2.9 2.5-5.8 5.4-9.4Z" />,
  bolt: <path d="M13.4 3.2 6.2 13.4h5L10.6 20.8 17.8 10.6h-5l.6-7.4Z" />,
  road: <path d="M7.6 3.6 4.6 20.4M16.4 3.6l3 16.8M12 4.2v2.6M12 10.6v2.6M12 16.8v3" />,
  trash: <path d="M4.6 6.6h14.8M9.6 6.6V4.6h4.8v2M6.6 6.6l1 12a1.5 1.5 0 0 0 1.5 1.4h5.8a1.5 1.5 0 0 0 1.5-1.4l1-12" />,
  lamp: <><path d="M12 20.4V9.2M12 9.2a3.4 3.4 0 0 0 3.4-3.4H8.6A3.4 3.4 0 0 0 12 9.2Z" /><path d="M8.2 20.4h7.6" /></>,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

const CATS = [
  { label: "Water", icon: "drop" as const },
  { label: "Power", icon: "bolt" as const },
  { label: "Roads", icon: "road" as const },
  { label: "Waste", icon: "trash" as const },
  { label: "Lights", icon: "lamp" as const },
];

/** "3d 20h" from hours. */
function dh(hours: number): string {
  const h = Math.max(0, Math.round(hours));
  return `${Math.floor(h / 24)}d ${String(h % 24).padStart(2, "0")}h`;
}

/** Everything on Home that has to come from the database, in one round. */
export async function loadHome(user: SessionUser) {
  const wardCode = user.wardCode ?? "";

  const [me, active, wardCases, unread, rankAbove, wardRankAbove] = await Promise.all([
    db.user.findUnique({ where: { id: user.id }, select: { streakDays: true } }),
    db.case.findMany({
      // Sorted BY TIME LEFT (invariant 4).
      where: { filedById: user.id, status: { notIn: ["RESOLVED", "CLOSED"] } },
      orderBy: { slaDueAt: "asc" },
      take: 3,
      select: { id: true, number: true, title: true, status: true, categoryId: true, departmentCode: true, createdAt: true, slaDueAt: true },
    }),
    db.case.findMany({
      where: { wardCode },
      select: { status: true, createdAt: true, resolvedAt: true, slaDueAt: true },
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.user.count({ where: { role: "CITIZEN", reputation: { gt: user.reputation } } }),
    db.case.groupBy({ by: ["wardCode"], _count: true }),
  ]);

  // Ward pulse
  const total = wardCases.length;
  const resolved = wardCases.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
  const onTime = resolved.filter((c) => (c.resolvedAt ?? c.createdAt) <= c.slaDueAt).length;
  const pct = total ? Math.round((onTime / total) * 100) : 0;
  const days = resolved
    .filter((c) => c.resolvedAt)
    .map((c) => (c.resolvedAt!.getTime() - c.createdAt.getTime()) / 86_400_000)
    .sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : 0;

  // Standing
  const tierIdx = REPUTATION_TIERS.findIndex((x) => user.reputation >= x.min && user.reputation <= x.max);
  const cur = REPUTATION_TIERS[tierIdx] ?? REPUTATION_TIERS[0];
  const next = REPUTATION_TIERS[tierIdx + 1];
  const span = cur.max - cur.min || 1;

  return {
    unread,
    pct,
    onTime,
    total,
    median,
    wardRank: wardRankAbove.filter((w) => w._count > total).length + 1,
    rankAbove,
    closedCount: resolved.length,
    openNearby: wardCases.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length,
    active,
    streakDays: me?.streakDays ?? 0,
    reputation: user.reputation,
    tier: tierForScore(user.reputation),
    tierIdx,
    next,
    standingPct: next ? Math.min(100, Math.round(((user.reputation - cur.min) / span) * 100)) : 100,
  };
}

export type HomeData = Awaited<ReturnType<typeof loadHome>>;

/**
 * Home. Rendered from loading.tsx with `data={null}` and from page.tsx with
 * the data promise — see Slot. Everything outside a Slot is on screen the
 * moment the tab is tapped.
 */
export function HomeView({ data }: { data: Promise<HomeData> | null }) {
  const month = new Date().toLocaleString("en", { month: "long", year: "numeric" }).toUpperCase();
  const heat = heatCells();

  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <CitizenTop
          title={<>नमस्ते, <FirstName /></>}
          sub={<>Ward <WardName /></>}
          unread={<Slot data={data} fallback={null}>{(d) => d.unread > 0 && <b>{d.unread}</b>}</Slot>}
        />

        <Slot data={data} fallback={<HeroPlaceholder h={310} />}>
          {(d) => <HomeHero pct={d.pct} />}
        </Slot>

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">Ward <WardName /> · {month}</div>
            <h1 className="dspl">Raise your voice</h1>
            <p className="lede">
              <b><Slot data={data} fallback={<SkIn />}>{(d) => <>{d.pct}%</>}</Slot></b> of
              complaints in your ward closed within their charter time this month —
              one lit window above for each.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Resolved</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2.6ch" />}>{(d) => <>{d.pct}<small>%</small></>}</Slot></div>
              <div className="sd"><Slot data={data} fallback={<Sk w="4.5em" />}>{(d) => <>{d.onTime} of {d.total}</>}</Slot></div>
            </div>
            <div>
              <div className="sk">Median</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="3ch" />}>{(d) => <>{d.median.toFixed(1)}<small>d</small></>}</Slot></div>
              <div className="sd">Charter 7d</div>
            </div>
            <div>
              <div className="sk">Rank</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="3ch" />}>{(d) => <>{d.wardRank}<small>/{WARDS.length}</small></>}</Slot></div>
              <div className="sd"><Slot data={data} fallback={<Sk w="3.5em" />}>{(d) => <>You #{d.rankAbove + 1}</>}</Slot></div>
            </div>
          </div>

          <div className="reveal" data-d="2">
            <div className="actions">
              <Link href="/file" className="btn p"><Icon d="plus" sw={2.2} />File a complaint</Link>
              <VoiceMicButton ariaLabel="Speak instead" />
            </div>
            <div className="cats">
              {CATS.map((c) => (
                <Link key={c.label} href="/file" className="cat">
                  <Icon d={c.icon} />
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Your active cases</b><span>By time left</span></div>
            <Slot data={data} fallback={<CaseRowsSkeleton n={3} />}>
              {(d) =>
                d.active.length === 0 ? (
                  <div className="case"><div className="t">No active cases</div><div className="m">FILE ONE TO START TRACKING</div></div>
                ) : (
                  d.active.map((c) => {
                    const created = c.createdAt.getTime();
                    const limitDays = Math.max(1, Math.round((c.slaDueAt.getTime() - created) / 86_400_000));
                    const elapsedH = (Date.now() - created) / 3_600_000;
                    const remainH = (c.slaDueAt.getTime() - Date.now()) / 3_600_000;
                    const over = remainH < 0;
                    const w = Math.min(100, Math.round((elapsedH / (limitDays * 24)) * 78));
                    const dept = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? c.departmentCode;
                    return (
                      <Link key={c.id} href={`/cases/${c.id}`} className="case slot">
                        <div className="hd">
                          <div>
                            <div className="t">{c.title}</div>
                            <div className="m">{c.number} · {dept.toUpperCase()}</div>
                          </div>
                          <span className={`pill ${over ? "dg" : "wn"}`}>
                            <Icon d={over ? "up" : "clk"} sw={over ? 2.3 : 1.9} />
                            {over ? "Escalated" : "In progress"}
                          </span>
                        </div>
                        <div className="trk">
                          <i data-w={w} style={{ background: over ? "var(--danger)" : "var(--warn)" }} />
                          <u style={{ left: "78%" }} />
                        </div>
                        <div className="cap">
                          <span><b>{dh(elapsedH)}</b> elapsed</span>
                          <span>Limit {limitDays}d · <b>{dh(Math.abs(remainH))} {over ? "over" : "left"}</b></span>
                        </div>
                      </Link>
                    );
                  })
                )
              }
            </Slot>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Ward trend</b><span>30 days</span></div>
            <div className="chart" dangerouslySetInnerHTML={{ __html: ridgeline() }} />
            <div className="ax"><span>30 DAYS AGO</span><span>TODAY</span></div>
            <div className="lg">
              <span><i style={{ background: "var(--warn)" }} />Filed <b><Slot data={data} fallback={<SkIn />}>{(d) => d.total}</Slot></b></span>
              <span><i style={{ background: "var(--ok)" }} />Closed <b><Slot data={data} fallback={<SkIn />}>{(d) => d.closedCount}</Slot></b></span>
              <span style={{ marginLeft: "auto" }}>Backlog <b><Slot data={data} fallback={<SkIn />}>{(d) => <>+{d.total - d.closedCount}</>}</Slot></b></span>
            </div>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Near you</b><span>500 m radius</span></div>
            <div className="heat">
              {heat.map((c, i) => (
                <i key={i} style={{ background: c.bg, ["--o" as string]: c.o, animationDelay: c.delay }} />
              ))}
            </div>
            <div className="cap" style={{ marginTop: 11 }}>
              <span>West</span>
              <span><b><Slot data={data} fallback={<SkIn />}>{(d) => d.openNearby}</Slot> open</b> · in your ward</span>
              <span>East</span>
            </div>
            <Link href="/feed" className="btn s w" style={{ marginTop: 15 }}>Browse the ward feed</Link>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Your standing</b><span>Tier <Slot data={data} fallback={<SkIn w="1ch" />}>{(d) => d.tierIdx + 1}</Slot></span></div>
            <div className="standing">
              <div className="av"><Initials /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t" style={{ fontSize: "14.5px", fontWeight: 600 }}>
                  <Slot data={data} fallback={<Sk w="42%" />}>{(d) => d.tier}</Slot>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: 3 }}>
                  <Slot data={data} fallback={<Sk w="72%" />}>
                    {(d) => (
                      <>
                        {d.reputation.toLocaleString()} points
                        {d.next ? ` · ${d.next.min - d.reputation} to ${d.next.name}` : " · top tier"}
                      </>
                    )}
                  </Slot>
                </div>
                <div className="trk" style={{ marginTop: 10 }}>
                  <Slot data={data} fallback={null}>{(d) => <i data-w={d.standingPct} style={{ background: "var(--gold)" }} />}</Slot>
                </div>
              </div>
              <div style={{ flex: "0 0 auto", textAlign: "center" }}>
                <Slot data={data} fallback={<div style={{ width: 50, height: 50 }} />}>
                  {(d) => <div dangerouslySetInnerHTML={{ __html: streakEmblem(d.streakDays, 30, 50) }} />}
                </Slot>
                <div style={{ fontSize: "9.5px", color: "var(--muted)", marginTop: 4, whiteSpace: "nowrap" }}>
                  <b style={{ color: "var(--ink)" }}><Slot data={data} fallback={<SkIn w="1.5ch" />}>{(d) => d.streakDays}</Slot></b> days
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
