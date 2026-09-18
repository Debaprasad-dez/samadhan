import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { humanizeCode, initials } from "@/lib/utils";
import type { EventType } from "@/types";
import type { RoadStage } from "@/lib/art/journey-road";
import { CaseHero } from "@/components/citizen/case-hero";
import { CaseSticky } from "@/components/citizen/case-sticky";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { ConfirmFix } from "@/components/citizen/confirm-fix";
import { GhostHero } from "@/components/citizen/ghost-hero";
import { HereLink } from "@/components/citizen/here-link";
import { Slot } from "@/components/citizen/slot";
import { Sk, SkIn } from "@/components/citizen/skeletons";

const IC = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  share: <><path d="M4 12v7.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V12" /><path d="M12 15.5V3.5M8 7l4-3.5L16 7" /></>,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  phone: <path d="M6.2 3.6h2.6l1.5 4-1.9 1.4a11.5 11.5 0 0 0 5.2 5.2l1.4-1.9 4 1.5v2.6a2.2 2.2 0 0 1-2.4 2.2C10.2 17.9 6.1 13.8 4 6.5a2.2 2.2 0 0 1 2.2-2.9Z" />,
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
const fmtUpper = (d: Date) => fmt(d).toUpperCase();

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

/** One case, its road, and its peers. The viewer and the case load together. */
export async function loadCase(id: string) {
  const [user, c] = await Promise.all([
    getCurrentUser(),
    db.case.findUnique({
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
    }),
  ]);
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

  // ---- the road: one gate per journey event, spaced by real elapsed time ----
  const gates = c.events.filter((e) => GATE[e.type as EventType]);
  const stages: RoadStage[] = gates.map((e, i) => {
    const nextAt = gates[i + 1]?.createdAt.getTime() ?? Math.min(now, c.slaDueAt.getTime());
    return {
      h: (e.createdAt.getTime() - created) / 3_600_000,
      label: GATE[e.type as EventType] ?? e.type,
      dur: dur(nextAt - e.createdAt.getTime()),
    };
  });
  if (stages.length === 0) stages.push({ h: 0, label: "FILED" });

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

  return {
    c,
    isOwner,
    now,
    limitH,
    limitDays,
    elapsedH,
    remainH,
    over,
    settled,
    category: CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? "—",
    ward: WARDS.find((x) => x.code === c.wardCode)?.name ?? c.wardCode,
    dayOf: Math.min(limitDays, Math.max(1, Math.ceil(elapsedH / 24))),
    stages,
    nowH: Math.min(elapsedH, limitH * 0.995),
    peerCount: peerDays.length,
    medianDays,
    peerOver: medianDays - limitDays,
    aheadOfPace: elapsedH / 24 < medianDays,
    headline: settled
      ? c.status === "CLOSED" ? "Closed" : "Awaiting your confirmation"
      : over
        ? `${dh(Math.abs(remainH))} over`
        : `${Math.floor(remainH / 24)} day${Math.floor(remainH / 24) === 1 ? "" : "s"} left`,
  };
}

export type CaseData = Awaited<ReturnType<typeof loadCase>>;

/** Journey nodes in waiting: hollow dots, bars where the dates and titles go. */
function JourneySkeleton() {
  return (
    <div className="jr" aria-busy aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div key={i} className="jn pend">
          <div className="d" />
          <div className="w"><Sk w="38%" /></div>
          <div className="h2"><Sk w="60%" /></div>
        </div>
      ))}
    </div>
  );
}

function PersonSkeleton() {
  return (
    <div className="who2" aria-busy aria-label="Loading">
      <div className="av" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="nm"><Sk w="48%" /></div>
        <div className="rl"><Sk w="70%" /></div>
      </div>
    </div>
  );
}

/**
 * One case. Rendered from loading.tsx with `data={null}` — see Slot. A loading
 * shell gets no route params, so the share link resolves its own address.
 */
export function CaseView({ data }: { data: Promise<CaseData> | null }) {
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
              <div className="greet" style={{ fontSize: "17px" }}>
                <Slot data={data} fallback={<Sk w="72%" />}>{(d) => d.c.title}</Slot>
              </div>
              <div className="ward" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: "10.5px" }}>
                <Slot data={data} fallback={<Sk w="46%" />}>
                  {(d) => <>{d.c.number} · {humanizeCode(d.c.departmentCode).toUpperCase()}</>}
                </Slot>
              </div>
            </div>
            <HereLink className="bell" label="Share this case">
              <Icon d="share" />
            </HereLink>
          </div>
        </header>

        <Slot data={data} fallback={<GhostHero kind="road" />}>
          {(d) => (
            <CaseHero
              stages={d.stages}
              nowH={d.nowH}
              limitH={d.limitH}
              limitLabel={`${d.limitDays}-DAY LIMIT`}
              nowLabel={`NOW · DAY ${d.dayOf}`}
            />
          )}
        </Slot>

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">
              <Slot data={data} fallback={<Sk w="54%" />}>{(d) => <>Filed {fmt(d.c.createdAt)} · {d.ward}</>}</Slot>
            </div>
            <h1 className="dspl"><Slot data={data} fallback={<Sk w="58%" />}>{(d) => d.headline}</Slot></h1>
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
                <Slot data={data} fallback={<Sk w="4ch" />}>
                  {(d) => (
                    <>
                      {Math.floor(d.elapsedH / 24)}<small>d</small>{" "}
                      {String(Math.round(d.elapsedH % 24)).padStart(2, "0")}<small>h</small>
                    </>
                  )}
                </Slot>
              </div>
              <div className="sd">since filing</div>
            </div>
            <div>
              <div className="sk">Limit</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2.4ch" />}>{(d) => <>{d.limitDays}<small>d</small></>}</Slot></div>
              <div className="sd"><Slot data={data} fallback={<Sk w="5em" />}>{(d) => <>{d.category.toLowerCase()} charter</>}</Slot></div>
            </div>
            <div>
              <div className="sk"><Slot data={data} fallback={<SkIn w="3ch" />}>{(d) => (d.over ? "Over" : "Left")}</Slot></div>
              <div className="sv">
                <Slot data={data} fallback={<Sk w="4ch" />}>
                  {(d) => (
                    <span style={{ color: d.over ? "var(--danger)" : "var(--warn)" }}>
                      {Math.floor(Math.abs(d.remainH) / 24)}<small>d</small>{" "}
                      {String(Math.round(Math.abs(d.remainH) % 24)).padStart(2, "0")}<small>h</small>
                    </span>
                  )}
                </Slot>
              </div>
              <div className="sd">
                <Slot data={data} fallback={<Sk w="5em" />}>{(d) => (d.over ? "past the limit" : "to escalation")}</Slot>
              </div>
            </div>
          </div>

          <div className="reveal" data-d="2" style={{ marginTop: 18 }}>
            <div className="trk">
              <Slot data={data} fallback={null}>
                {(d) => (
                  <i
                    data-w={Math.min(100, Math.round((d.elapsedH / d.limitH) * 78))}
                    style={{ background: d.over ? "var(--danger)" : "var(--warn)" }}
                  />
                )}
              </Slot>
              <u style={{ left: "78%" }} />
            </div>
            <div className="cap">
              <span>Filed <b><Slot data={data} fallback={<SkIn w="7em" />}>{(d) => fmt(d.c.createdAt)}</Slot></b></span>
              <span>Limit <b><Slot data={data} fallback={<SkIn w="7em" />}>{(d) => fmt(d.c.slaDueAt)}</Slot></b></span>
            </div>
          </div>

          <Slot
            data={data}
            fallback={
              <section className="reveal" data-d="0">
                <div className="sh"><b>Who is holding it</b><span>Assigned</span></div>
                <PersonSkeleton />
              </section>
            }
          >
            {(d) =>
              d.c.assignedTo && (
                <section className="reveal" data-d="0">
                  <div className="sh"><b>Who is holding it</b><span>Assigned</span></div>
                  <div className="who2 slot">
                    <div className="av">{initials(d.c.assignedTo.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="nm">{d.c.assignedTo.name}</div>
                      <div className="rl">
                        Officer · {humanizeCode(d.c.assignedTo.departmentCode ?? d.c.departmentCode)}
                        {d.c.assignedTo.wardCode ? `, ward ${d.c.assignedTo.wardCode}` : ""}
                      </div>
                    </div>
                    <a className="call" href="tel:1916">
                      <Icon d="phone" />
                      Call
                    </a>
                  </div>
                </section>
              )
            }
          </Slot>

          <section className="reveal" data-d="0">
            <div className="sh"><b>Service journey</b><span>Time in each stage</span></div>
            <Slot data={data} fallback={<JourneySkeleton />}>
              {(d) => (
                <>
                  <div className="jr slot">
                    {d.c.events.map((e, i) => {
                      const isLast = i === d.c.events.length - 1;
                      const live = isLast && !d.settled;
                      const next = d.c.events[i + 1];
                      const legMs = (next?.createdAt.getTime() ?? d.now) - e.createdAt.getTime();
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
                                ? `Acknowledged by ${humanizeCode(d.c.departmentCode)}`
                                : e.type === "REASSIGNED" && e.actor
                                  ? `Assigned to ${e.actor.name}`
                                  : humanizeCode(e.type)}
                          </div>
                          {e.message && <div className="p2">{e.message}</div>}
                          {live && d.c.evidence.length > 0 && (
                            <div className="photos">
                              {d.c.evidence.slice(0, 3).map((ev) => (
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

                    {!d.settled && (
                      <div className="jn next">
                        <div className="d"><Icon d="up" sw={2.3} /></div>
                        <div className="w" style={{ color: "var(--danger)" }}>
                          {fmtUpper(d.c.slaDueAt)} · AUTOMATIC
                        </div>
                        <div className="h2">Escalates to the ward lead</div>
                      </div>
                    )}

                    <div className="jn pend">
                      <div className="d" />
                      <div className="w">{d.c.status === "CLOSED" ? "DONE" : "PENDING"}</div>
                      <div className="h2">You confirm the fix</div>
                      <div className="p2">
                        The case only closes when a citizen says it is actually fixed.
                      </div>
                    </div>
                  </div>

                  {d.c.status === "RESOLVED" && d.isOwner && <ConfirmFix caseId={d.c.id} />}

                  {!d.settled && (
                    <div className="esc">
                      <div className="t3">It escalates on its own</div>
                      <div className="s4">
                        If this is not resolved by <b>{fmt(d.c.slaDueAt)}</b>, it moves up
                        one rung automatically and the ward lead becomes responsible.
                        You do not have to ask.
                      </div>
                    </div>
                  )}
                </>
              )}
            </Slot>
          </section>

          {/* Only shown when there are peers to compare with, so it has no
              placeholder: a skeleton that then vanished would be worse. */}
          <Slot data={data} fallback={null}>
            {(d) =>
              d.peerCount > 0 && (
                <section className="reveal slot" data-d="0">
                  <div className="sh"><b>Comparable cases</b><span>Same category, this ward</span></div>
                  <div className="cap" style={{ marginTop: 15 }}>
                    <span>Median time to close</span>
                    <span><b>{d.medianDays.toFixed(1)} days</b> · n={d.peerCount}</span>
                  </div>
                  <div className="trk" style={{ marginTop: 8 }}>
                    <i
                      data-w={Math.min(100, Math.round((d.medianDays / d.limitDays) * 78))}
                      style={{ background: d.peerOver > 0 ? "var(--danger)" : "var(--ok)" }}
                    />
                    <u style={{ left: "78%" }} />
                  </div>
                  <div className="cap">
                    <span>Limit <b>{d.limitDays}d</b></span>
                    <span style={{ color: d.peerOver > 0 ? "var(--danger)" : "var(--ok)" }}>
                      <b>{Math.abs(d.peerOver).toFixed(1)}d {d.peerOver > 0 ? "over" : "under"}</b> on average
                    </span>
                  </div>
                  <div className="esc" style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
                    <div className="s4" style={{ marginTop: 0 }}>
                      {d.category} cases in {d.ward} run about {Math.abs(d.peerOver).toFixed(1)} day
                      {Math.abs(d.peerOver) === 1 ? "" : "s"} {d.peerOver > 0 ? "over" : "under"} their
                      limit on average. Yours is currently{" "}
                      <b style={{ color: "var(--ink)" }}>
                        {d.aheadOfPace ? "ahead of that pace" : "behind that pace"}
                      </b>.
                    </div>
                  </div>
                </section>
              )
            }
          </Slot>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Support</b>
              <span>
                <Slot data={data} fallback={<SkIn w="5em" />}>
                  {(d) => <>{d.c._count.cosigns} co-sign{d.c._count.cosigns === 1 ? "" : "s"}</>}
                </Slot>
              </span>
            </div>
            <Slot data={data} fallback={<PersonSkeleton />}>
              {(d) => (
                <div className="who2 slot" style={{ background: "var(--brand-soft)", borderColor: "var(--brand-line)" }}>
                  <div className="av">+{d.c._count.cosigns}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="nm">
                      {d.c._count.cosigns} neighbour{d.c._count.cosigns === 1 ? "" : "s"} co-signed
                    </div>
                    <div className="rl">Co-signed cases close faster</div>
                  </div>
                </div>
              )}
            </Slot>
          </section>
        </div>
      </div>

      <Slot data={data} fallback={null}>
        {(d) =>
          d.isOwner && !d.settled && (
            <CaseSticky
              caseId={d.c.id}
              isOwner={d.isOwner}
              canEscalate={d.over && !d.c.escalated && d.c.status !== "ESCALATED"}
              escalateHint={
                d.c.escalated || d.c.status === "ESCALATED"
                  ? "Already escalated."
                  : "It escalates on its own when the charter limit lapses."
              }
            />
          )
        }
      </Slot>
    </div>
  );
}
