import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { tierForScore } from "@/lib/reputation";
import { REPUTATION_TIERS } from "@/types";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { initials } from "@/lib/utils";
import { ridgeline, streakEmblem, heatCells } from "@/lib/art/ward-island";
import { HomeHero } from "@/components/citizen/home-hero";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { VoiceMicButton } from "@/components/citizen/voice-capture";

// Inline icon set — the mockup's symbols, drawn directly.
const IC = {
  bell: <><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
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

export default async function CitizenHome() {
  const user = await requireRole(["CITIZEN"]);
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

  const wardName = WARDS.find((w) => w.code === wardCode)?.name ?? wardCode;
  const month = new Date().toLocaleString("en", { month: "long", year: "numeric" }).toUpperCase();

  // Ward pulse
  const total = wardCases.length;
  const resolved = wardCases.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
  const onTime = resolved.filter((c) => (c.resolvedAt ?? c.createdAt) <= c.slaDueAt);
  const pct = total ? Math.round((onTime.length / total) * 100) : 0;
  const days = resolved
    .filter((c) => c.resolvedAt)
    .map((c) => (c.resolvedAt!.getTime() - c.createdAt.getTime()) / 86_400_000)
    .sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : 0;
  const wardRank = wardRankAbove.filter((w) => w._count > total).length + 1;
  const closedCount = resolved.length;

  // Standing
  const tier = tierForScore(user.reputation);
  const tierIdx = REPUTATION_TIERS.findIndex((x) => user.reputation >= x.min && user.reputation <= x.max);
  const cur = REPUTATION_TIERS[tierIdx] ?? REPUTATION_TIERS[0];
  const next = REPUTATION_TIERS[tierIdx + 1];
  const span = cur.max - cur.min || 1;
  const standingPct = next ? Math.min(100, Math.round(((user.reputation - cur.min) / span) * 100)) : 100;

  const heat = heatCells();
  const openNearby = wardCases.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;

  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <header className="top">
          <div className="row">
            <div>
              <div className="greet">नमस्ते, {user.name.split(" ")[0]}</div>
              <div className="ward">Ward {wardName}</div>
            </div>
            <Link href="/notifications" className="bell" aria-label={`${unread} notifications`}>
              <Icon d="bell" />
              {unread > 0 && <b>{unread}</b>}
            </Link>
          </div>
        </header>

        <HomeHero pct={pct} />

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">Ward {wardName} · {month}</div>
            <h1 className="dspl">Raise your voice</h1>
            <p className="lede">
              <b>{pct}%</b> of complaints in your ward closed within their charter
              time this month — one lit window above for each.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Resolved</div>
              <div className="sv">{pct}<small>%</small></div>
              <div className="sd">{onTime.length} of {total}</div>
            </div>
            <div>
              <div className="sk">Median</div>
              <div className="sv">{median.toFixed(1)}<small>d</small></div>
              <div className="sd">Charter 7d</div>
            </div>
            <div>
              <div className="sk">Rank</div>
              <div className="sv">{wardRank}<small>/{WARDS.length}</small></div>
              <div className="sd">You #{rankAbove + 1}</div>
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
            {active.length === 0 ? (
              <div className="case"><div className="t">No active cases</div><div className="m">FILE ONE TO START TRACKING</div></div>
            ) : (
              active.map((c) => {
                const created = c.createdAt.getTime();
                const limitDays = Math.max(1, Math.round((c.slaDueAt.getTime() - created) / 86_400_000));
                const elapsedH = (Date.now() - created) / 3_600_000;
                const remainH = (c.slaDueAt.getTime() - Date.now()) / 3_600_000;
                const over = remainH < 0;
                const w = Math.min(100, Math.round((elapsedH / (limitDays * 24)) * 78));
                const dept = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? c.departmentCode;
                return (
                  <Link key={c.id} href={`/cases/${c.id}`} className="case">
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
            )}
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Ward trend</b><span>30 days</span></div>
            <div className="chart" dangerouslySetInnerHTML={{ __html: ridgeline() }} />
            <div className="ax"><span>30 DAYS AGO</span><span>TODAY</span></div>
            <div className="lg">
              <span><i style={{ background: "var(--warn)" }} />Filed <b>{total}</b></span>
              <span><i style={{ background: "var(--ok)" }} />Closed <b>{closedCount}</b></span>
              <span style={{ marginLeft: "auto" }}>Backlog <b>+{total - closedCount}</b></span>
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
              <span><b>{openNearby} open</b> · in your ward</span>
              <span>East</span>
            </div>
            <Link href="/feed" className="btn s w" style={{ marginTop: 15 }}>Browse the ward feed</Link>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Your standing</b><span>Tier {tierIdx + 1}</span></div>
            <div className="standing">
              <div className="av">{initials(user.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t" style={{ fontSize: "14.5px", fontWeight: 600 }}>{tier}</div>
                <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: 3 }}>
                  {user.reputation.toLocaleString()} points
                  {next ? ` · ${next.min - user.reputation} to ${next.name}` : " · top tier"}
                </div>
                <div className="trk" style={{ marginTop: 10 }}>
                  <i data-w={standingPct} style={{ background: "var(--gold)" }} />
                </div>
              </div>
              <div style={{ flex: "0 0 auto", textAlign: "center" }}>
                <div dangerouslySetInnerHTML={{ __html: streakEmblem(me?.streakDays ?? 0, 30, 50) }} />
                <div style={{ fontSize: "9.5px", color: "var(--muted)", marginTop: 4, whiteSpace: "nowrap" }}>
                  <b style={{ color: "var(--ink)" }}>{me?.streakDays ?? 0}</b> days
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
