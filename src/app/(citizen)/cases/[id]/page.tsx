import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { humanizeCode, initials } from "@/lib/utils";
import { CaseHero } from "@/components/citizen/case-hero";
import { CaseSticky } from "@/components/citizen/case-sticky";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { ConfirmFix } from "@/components/citizen/confirm-fix";
import type { RoadStage } from "@/lib/art/journey-road";
import type { EventType } from "@/types";

const IC = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  share: <><path d="M4 12v7.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V12" /><path d="M12 15.5V3.5M8 7l4-3.5L16 7" /></>,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  phone: <path d="M6.2 3.6h2.6l1.5 4-1.9 1.4a11.5 11.5 0 0 0 5.2 5.2l1.4-1.9 4 1.5v2.6a2.2 2.2 0 0 1-2.4 2.2C10.2 17.9 6.1 13.8 4 6.5a2.2 2.2 0 0 1 2.2-2.9Z" />,
  cam: <><path d="M3.5 8.5h3.2l1.4-2.4h7.8l1.4 2.4h3.2v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z" /><circle cx="12" cy="13.2" r="3.6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" />,
  feed: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M7 9h6M7 13h10M7 16h7" /></>,
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

/** "2d 5h" / "15h 13m" / "21 min" — the mockup's leg-duration grammar. */
function dur(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60_000));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), rm = m % 60;
  if (h < 24) return `${h}h ${String(rm).padStart(2, "0")}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
function dh(hours: number): string {
  const h = Math.max(0, Math.round(hours));
  return `${Math.floor(h / 24)}d ${String(h % 24).padStart(2, "0")}h`;
}
const fmt = (d: Date) =>
  d.toLocaleString("en", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" });
const fmtUpper = (d: Date) =>
  d.toLocaleString("en", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" }).toUpperCase();

// Which event types are journey gates, and the short label the road uses.
const GATE: Partial<Record<EventType, string>> = {
  CREATED: "FILED",
  ACKNOWLEDGED: "ACK",
  REASSIGNED: "ASSIGNED",
  STATUS_CHANGED: "UPDATE",
  INFO_REQUESTED: "INFO",
  INFO_PROVIDED: "REPLY",
  EVIDENCE_ADDED: "PHOTO",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
  REOPENED: "REOPENED",
  CLOSED: "CLOSED",
};

export default async function CaseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const c = await db.case.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true, departmentCode: true } } },
      },
      evidence: true,
      assignedTo: { select: { name: true, departmentCode: true, wardCode: true } },
      _count: { select: { upvotes: true, cosigns: true } },
    },
  });
  if (!c) notFound();

  const isOwner = user?.id === c.filedById;
  const isStaff = user?.role === "OFFICER" || user?.role === "ADMIN";
  if (!isOwner && !isStaff && !c.isPublic) notFound();

  const now = Date.now();
  const created = c.createdAt.getTime();
  const limitH = (c.slaDueAt.getTime() - created) / 3_600_000;
  const limitDays = Math.max(1, Math.round(limitH / 24));
  const elapsedH = (now - created) / 3_600_000;
  const remainH = (c.slaDueAt.getTime() - now) / 3_600_000;
  const over = remainH < 0;
  const settled = c.status === "RESOLVED" || c.status === "CLOSED";
  const category = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? "—";
  const ward = WARDS.find((x) => x.code === c.wardCode)?.name ?? c.wardCode;
  const dayOf = Math.min(limitDays, Math.max(1, Math.ceil(elapsedH / 24)));

  // ---- the road: one gate per journey event, spaced by real elapsed time ----
  const gates = c.events.filter((e) => GATE[e.type as EventType]);
  const stages: RoadStage[] = gates.map((e, i) => {
    const h = (e.createdAt.getTime() - created) / 3_600_000;
    const nextAt = gates[i + 1]?.createdAt.getTime() ?? Math.min(now, c.slaDueAt.getTime());
    return {
      h,
      label: GATE[e.type as EventType] ?? e.type,
      dur: dur(nextAt - e.createdAt.getTime()),
    };
  });
  if (stages.length === 0) stages.push({ h: 0, label: "FILED" });
  const nowH = Math.min(elapsedH, limitH * 0.995);

  // ---- comparable cases in the same category + ward ----
  const peers = await db.case.findMany({
    where: {
      categoryId: c.categoryId,
      wardCode: c.wardCode,
      status: { in: ["RESOLVED", "CLOSED"] },
      id: { not: c.id },
      resolvedAt: { not: null },
    },
    select: { createdAt: true, resolvedAt: true },
  });
  const peerDays = peers
    .map((p) => (p.resolvedAt!.getTime() - p.createdAt.getTime()) / 86_400_000)
    .sort((a, b) => a - b);
  const medianDays = peerDays.length ? peerDays[Math.floor(peerDays.length / 2)] : 0;
  const peerOver = medianDays - limitDays;
  const aheadOfPace = elapsedH / 24 < medianDays;

  // ---- headline ----
  const headline = settled
    ? c.status === "CLOSED" ? "Closed" : "Awaiting your confirmation"
    : over
      ? `${dh(Math.abs(remainH))} over`
      : `${Math.floor(remainH / 24)} day${Math.floor(remainH / 24) === 1 ? "" : "s"} left`;

  const officer = c.assignedTo;

  return (
    <div className="chome casepage">
      <HomeReveal />
      <div className="shell">
        <header className="top">
          <div className="row">
            <Link href="/cases" className="backbtn" aria-label="Back to cases">
              <Icon d="back" sw={1.9} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="greet" style={{ fontSize: "17px" }}>{c.title}</div>
              <div className="ward" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: "10.5px" }}>
                {c.number} · {humanizeCode(c.departmentCode).toUpperCase()}
              </div>
            </div>
            <Link href={`/cases/${c.id}`} className="bell" aria-label="Share this case">
              <Icon d="share" />
            </Link>
          </div>
        </header>

        <CaseHero
          stages={stages}
          nowH={nowH}
          limitH={limitH}
          limitLabel={`${limitDays}-DAY LIMIT`}
          nowLabel={`NOW · DAY ${dayOf}`}
        />

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">
              Filed {fmt(c.createdAt)} · {ward}
            </div>
            <h1 className="dspl">{headline}</h1>
            <p className="lede">
              The gaps on the road above are real time. The longest stretch is
              where this case waited between stages — <b>that is where the delay
              lives</b>.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Elapsed</div>
              <div className="sv">
                {Math.floor(elapsedH / 24)}<small>d</small> {String(Math.round(elapsedH % 24)).padStart(2, "0")}<small>h</small>
              </div>
              <div className="sd">since filing</div>
            </div>
            <div>
              <div className="sk">Limit</div>
              <div className="sv">{limitDays}<small>d</small></div>
              <div className="sd">{category.toLowerCase()} charter</div>
            </div>
            <div>
              <div className="sk">{over ? "Over" : "Left"}</div>
              <div className="sv" style={{ color: over ? "var(--danger)" : "var(--warn)" }}>
                {Math.floor(Math.abs(remainH) / 24)}<small>d</small> {String(Math.round(Math.abs(remainH) % 24)).padStart(2, "0")}<small>h</small>
              </div>
              <div className="sd">{over ? "past the limit" : "to escalation"}</div>
            </div>
          </div>

          <div className="reveal" data-d="2" style={{ marginTop: 18 }}>
            <div className="trk">
              <i
                data-w={Math.min(100, Math.round((elapsedH / limitH) * 78))}
                style={{ background: over ? "var(--danger)" : "var(--warn)" }}
              />
              <u style={{ left: "78%" }} />
            </div>
            <div className="cap">
              <span>Filed <b>{fmt(c.createdAt)}</b></span>
              <span>Limit <b>{fmt(c.slaDueAt)}</b></span>
            </div>
          </div>

          {officer && (
            <section className="reveal" data-d="0">
              <div className="sh"><b>Who is holding it</b><span>Assigned</span></div>
              <div className="who2">
                <div className="av">{initials(officer.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="nm">{officer.name}</div>
                  <div className="rl">
                    Officer · {humanizeCode(officer.departmentCode ?? c.departmentCode)}
                    {officer.wardCode ? `, ward ${officer.wardCode}` : ""}
                  </div>
                </div>
                <a className="call" href="tel:1916">
                  <Icon d="phone" />
                  Call
                </a>
              </div>
            </section>
          )}

          <section className="reveal" data-d="0">
            <div className="sh"><b>Service journey</b><span>Time in each stage</span></div>
            <div className="jr">
              {c.events.map((e, i) => {
                const isLast = i === c.events.length - 1;
                const live = isLast && !settled;
                const next = c.events[i + 1];
                const legMs = (next?.createdAt.getTime() ?? now) - e.createdAt.getTime();
                return (
                  <div key={e.id} className={`jn ${live ? "live" : "done"}`}>
                    <div className="d">{!live && <Icon d="chk2" sw={2.4} />}</div>
                    <div className="w">
                      {fmtUpper(e.createdAt)}
                      <em>{dur(legMs)}{live ? " so far" : ""}</em>
                    </div>
                    <div className="h2">
                      {GATE[e.type as EventType] === "FILED"
                        ? "Filed"
                        : e.type === "ACKNOWLEDGED"
                          ? `Acknowledged by ${humanizeCode(c.departmentCode)}`
                          : e.type === "REASSIGNED" && e.actor
                            ? `Assigned to ${e.actor.name}`
                            : humanizeCode(e.type)}
                    </div>
                    {e.message && <div className="p2">{e.message}</div>}
                    {live && c.evidence.length > 0 && (
                      <div className="photos">
                        {c.evidence.slice(0, 3).map((ev) => (
                          <div key={ev.id} className="ph">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ev.url} alt={ev.filename} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {!settled && (
                <div className="jn next">
                  <div className="d"><Icon d="up" sw={2.3} /></div>
                  <div className="w" style={{ color: "var(--danger)" }}>
                    {fmtUpper(c.slaDueAt)} · AUTOMATIC
                  </div>
                  <div className="h2">Escalates to the ward lead</div>
                </div>
              )}

              <div className="jn pend">
                <div className="d" />
                <div className="w">{c.status === "CLOSED" ? "DONE" : "PENDING"}</div>
                <div className="h2">You confirm the fix</div>
                <div className="p2">
                  The case only closes when a citizen says it is actually fixed.
                </div>
              </div>
            </div>

            {c.status === "RESOLVED" && isOwner && <ConfirmFix caseId={c.id} />}

            {!settled && (
              <div className="esc">
                <div className="t3">It escalates on its own</div>
                <div className="s4">
                  If this is not resolved by <b>{fmt(c.slaDueAt)}</b>, it moves up
                  one rung automatically and the ward lead becomes responsible.
                  You do not have to ask.
                </div>
              </div>
            )}
          </section>

          {peerDays.length > 0 && (
            <section className="reveal" data-d="0">
              <div className="sh"><b>Comparable cases</b><span>Same category, this ward</span></div>
              <div className="cap" style={{ marginTop: 15 }}>
                <span>Median time to close</span>
                <span><b>{medianDays.toFixed(1)} days</b> · n={peerDays.length}</span>
              </div>
              <div className="trk" style={{ marginTop: 8 }}>
                <i
                  data-w={Math.min(100, Math.round((medianDays / limitDays) * 78))}
                  style={{ background: peerOver > 0 ? "var(--danger)" : "var(--ok)" }}
                />
                <u style={{ left: "78%" }} />
              </div>
              <div className="cap">
                <span>Limit <b>{limitDays}d</b></span>
                <span style={{ color: peerOver > 0 ? "var(--danger)" : "var(--ok)" }}>
                  <b>{Math.abs(peerOver).toFixed(1)}d {peerOver > 0 ? "over" : "under"}</b> on average
                </span>
              </div>
              <div className="esc" style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
                <div className="s4" style={{ marginTop: 0 }}>
                  {category} cases in {ward} run about{" "}
                  {Math.abs(peerOver).toFixed(1)} day
                  {Math.abs(peerOver) === 1 ? "" : "s"}{" "}
                  {peerOver > 0 ? "over" : "under"} their limit on average. Yours is
                  currently{" "}
                  <b style={{ color: "var(--ink)" }}>
                    {aheadOfPace ? "ahead of that pace" : "behind that pace"}
                  </b>.
                </div>
              </div>
            </section>
          )}

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Support</b>
              <span>{c._count.cosigns} co-sign{c._count.cosigns === 1 ? "" : "s"}</span>
            </div>
            <div className="who2" style={{ background: "var(--brand-soft)", borderColor: "var(--brand-line)" }}>
              <div className="av">+{c._count.cosigns}</div>
              <div style={{ minWidth: 0 }}>
                <div className="nm">
                  {c._count.cosigns} neighbour{c._count.cosigns === 1 ? "" : "s"} co-signed
                </div>
                <div className="rl">Co-signed cases close faster</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isOwner && !settled && (
        <CaseSticky
          caseId={c.id}
          isOwner={isOwner}
          canEscalate={over && !c.escalated && c.status !== "ESCALATED"}
          escalateHint={
            c.escalated || c.status === "ESCALATED"
              ? "Already escalated."
              : "It escalates on its own when the charter limit lapses."
          }
        />
      )}

      <nav className="nav">
        <Link href="/" className="nb"><Icon d="home" /><b>Home</b></Link>
        <Link href="/feed" className="nb"><Icon d="feed" /><b>Feed</b></Link>
        <Link href="/file" className="nb fab" aria-label="File a complaint">
          <div className="f"><Icon d="plus" sw={2.2} /></div>
        </Link>
        <Link href="/cases" className="nb on"><Icon d="list" /><b>Cases</b></Link>
        <Link href="/profile" className="nb"><Icon d="user" /><b>Profile</b></Link>
      </nav>
    </div>
  );
}
