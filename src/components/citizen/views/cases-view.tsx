import Link from "next/link";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/lib/seed-data";
import type { SessionUser } from "@/types";
import { CasesHero } from "@/components/citizen/cases-hero";
import { CaseFilters } from "@/components/citizen/case-filters";
import { ConfirmFix } from "@/components/citizen/confirm-fix";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { Slot } from "@/components/citizen/slot";
import { CaseRowsSkeleton, CitizenTop, Sk, SkIn } from "@/components/citizen/skeletons";
import { GhostHero } from "@/components/citizen/ghost-hero";
import { WardCode, WardName } from "@/components/citizen/session-bits";
import type { YardCase } from "@/lib/art/limit-yard";

const IC = {
  clk: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  chev: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

/** "3d 20h" from hours. */
function dh(hours: number): string {
  const h = Math.max(0, Math.round(hours));
  return `${Math.floor(h / 24)}d ${String(h % 24).padStart(2, "0")}h`;
}

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const OPEN_STATES = new Set(["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "AWAITING_INFO", "ESCALATED"]);

const limitDaysOf = (c: { createdAt: Date; slaDueAt: Date }) =>
  Math.max(1, Math.round((c.slaDueAt.getTime() - c.createdAt.getTime()) / 86_400_000));

/** Everything on Cases that has to come from the database, in one round. */
export async function loadCases(user: SessionUser) {
  const [all, unread] = await Promise.all([
    db.case.findMany({
      where: { filedById: user.id },
      orderBy: { slaDueAt: "asc" }, // invariant 4: by time left, never date filed
      select: {
        id: true, number: true, title: true, status: true, categoryId: true,
        departmentCode: true, createdAt: true, slaDueAt: true, resolvedAt: true, closedAt: true,
      },
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  const now = Date.now();
  const active = all.filter((c) => OPEN_STATES.has(c.status));
  const awaiting = all.filter((c) => c.status === "RESOLVED");
  const closed = all.filter((c) => c.status === "CLOSED");
  const pastLimit = active.filter((c) => c.slaDueAt.getTime() < now).length;

  // Hero columns: elapsed / limit for up to six of the most pressing cases.
  const yard: YardCase[] = [...active, ...awaiting].slice(0, 6).map((c) => {
    const limitH = limitDaysOf(c) * 24;
    const elapsedH = ((c.resolvedAt ?? new Date(now)).getTime() - c.createdAt.getTime()) / 3_600_000;
    return { id: c.number, frac: limitH > 0 ? elapsedH / limitH : 0 };
  });

  return {
    now,
    unread,
    total: all.length,
    active,
    awaiting,
    closed,
    pastLimit,
    yard,
    headline: pastLimit === 0 ? "All inside the ceiling" : `${WORDS[pastLimit] ?? pastLimit} broke the ceiling`,
  };
}

export type CasesData = Awaited<ReturnType<typeof loadCases>>;

/** The citizen's cases. Rendered from loading.tsx with `data={null}` — see Slot. */
export function CasesView({ data }: { data: Promise<CasesData> | null }) {
  const count = (pick: (d: CasesData) => number) => (
    <Slot data={data} fallback={<SkIn w="1ch" />}>{(d) => pick(d)}</Slot>
  );

  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <CitizenTop
          title="Your cases"
          sub={
            <>
              Ward <WardCode /> · <WardName /> ·{" "}
              <Slot data={data} fallback={<SkIn w="4em" />}>
                {(d) => <>{d.active.length} open{d.pastLimit > 0 ? `, ${d.pastLimit} past its limit` : ""}</>}
              </Slot>
            </>
          }
          unread={<Slot data={data} fallback={null}>{(d) => d.unread > 0 && <b>{d.unread}</b>}</Slot>}
        />

        <Slot data={data} fallback={<GhostHero kind="yard" />}>
          {(d) => <CasesHero cases={d.yard} />}
        </Slot>

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">
              <Slot data={data} fallback={<SkIn w="4em" />}>
                {(d) => <>{d.total} case{d.total === 1 ? "" : "s"}</>}
              </Slot>{" "}
              · elapsed against limit
            </div>
            <h1 className="dspl"><Slot data={data} fallback={<Sk w="70%" />}>{(d) => d.headline}</Slot></h1>
            <p className="lede">
              Every column is one case, scaled against <b>its own charter limit</b> —
              so a 24-hour power fault and a 10-day road repair stand side by side
              honestly. Anything through the glass has escalated on its own.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Open</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.active.length}</Slot></div>
              <div className="sd"><Slot data={data} fallback={<Sk w="4.5em" />}>{(d) => <>{d.awaiting.length} need you</>}</Slot></div>
            </div>
            <div>
              <div className="sk">Past limit</div>
              <div className="sv">
                <Slot data={data} fallback={<Sk w="2ch" />}>
                  {(d) => <span style={{ color: d.pastLimit ? "var(--danger)" : undefined }}>{d.pastLimit}</span>}
                </Slot>
              </div>
              <div className="sd">escalated</div>
            </div>
            <div>
              <div className="sk">Closed</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.closed.length}</Slot></div>
              <div className="sd">all time</div>
            </div>
          </div>

          <CaseFilters
            counts={{
              active: count((d) => d.active.length),
              await: count((d) => d.awaiting.length),
              closed: count((d) => d.closed.length),
            }}
          >
            <section className="reveal" data-sec="active" data-d="0">
              <div className="sh"><b>Active</b><span>Sorted by time left</span></div>
              <Slot data={data} fallback={<CaseRowsSkeleton n={3} className="crow" />}>
                {(d) =>
                  d.active.length === 0 ? (
                    <div className="crow"><div className="body2"><div className="t">Nothing open</div>
                      <div className="m">FILE A COMPLAINT TO START TRACKING</div></div></div>
                  ) : (
                    d.active.map((c) => {
                      const limitDays = limitDaysOf(c);
                      const elapsedH = (d.now - c.createdAt.getTime()) / 3_600_000;
                      const remainH = (c.slaDueAt.getTime() - d.now) / 3_600_000;
                      const over = remainH < 0;
                      const w = Math.min(100, Math.round((elapsedH / (limitDays * 24)) * 78));
                      const cat = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? c.departmentCode;
                      return (
                        <Link key={c.id} href={`/cases/${c.id}`} className="crow slot">
                          <div className="body2">
                            <div className="hd">
                              <div>
                                <div className="t">{c.title}</div>
                                <div className="m">{c.number} · {cat.toUpperCase()}</div>
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
                          </div>
                          <span className="chev"><Icon d="chev" sw={1.9} /></span>
                        </Link>
                      );
                    })
                  )
                }
              </Slot>
            </section>

            <section className="reveal" data-sec="await" data-d="0">
              <div className="sh">
                <b>Awaiting you</b>
                <span>
                  <Slot data={data} fallback={<SkIn w="3em" />}>
                    {(d) => <>{d.awaiting.length} item{d.awaiting.length === 1 ? "" : "s"}</>}
                  </Slot>
                </span>
              </div>
              <Slot data={data} fallback={<CaseRowsSkeleton n={1} className="crow" />}>
                {(d) =>
                  d.awaiting.length === 0 ? (
                    <div className="crow"><div className="body2"><div className="t">Nothing to confirm</div>
                      <div className="m">WE&rsquo;LL ASK WHEN A CASE IS MARKED RESOLVED</div></div></div>
                  ) : (
                    d.awaiting.map((c) => (
                      <div key={c.id} className="note2 slot">
                        <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                          <span style={{ color: "var(--ok)", flex: "0 0 auto", width: 18, height: 18, marginTop: 1 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                              <path d="M5 12.5 10 17.5 19 6.5" />
                            </svg>
                          </span>
                          <div>
                            <div className="t" style={{ fontSize: "13.5px", fontWeight: 600 }}>
                              {c.title} is marked fixed
                            </div>
                            <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
                              Confirm it and the case closes. If it isn&rsquo;t actually
                              fixed, reopening keeps the original clock.
                            </div>
                            <ConfirmFix caseId={c.id} />
                          </div>
                        </div>
                      </div>
                    ))
                  )
                }
              </Slot>
            </section>

            <section className="reveal closed" data-sec="closed" data-d="0">
              <div className="sh"><b>Recently closed</b><span>Outcome · time</span></div>
              <Slot data={data} fallback={<CaseRowsSkeleton n={2} className="crow" />}>
                {(d) => (
                  <>
                    {d.closed.length === 0 ? (
                      <div className="crow"><div className="body2"><div className="t">Nothing closed yet</div>
                        <div className="m">RESOLVED CASES LAND HERE</div></div></div>
                    ) : (
                      d.closed.slice(0, 3).map((c) => {
                        const limitDays = limitDaysOf(c);
                        const end = (c.closedAt ?? c.resolvedAt ?? c.slaDueAt).getTime();
                        const tookH = (end - c.createdAt.getTime()) / 3_600_000;
                        const late = tookH > limitDays * 24;
                        const when = (c.closedAt ?? c.resolvedAt ?? c.createdAt)
                          .toLocaleString("en", { day: "2-digit", month: "short" })
                          .toUpperCase();
                        return (
                          <Link key={c.id} href={`/cases/${c.id}`} className="crow slot">
                            <div className="body2">
                              <div className="t">{c.title}</div>
                              <div className="m">CLOSED {when}</div>
                            </div>
                            <div className="out">
                              <div className="v3" style={{ color: late ? "var(--danger)" : "var(--ok)" }}>
                                {dh(tookH)}
                              </div>
                              <div className="u3">of {limitDays}d limit</div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                    {d.closed.length > 3 && (
                      <Link href="/feed" className="btn s w" style={{ marginTop: 16 }}>
                        See all {d.closed.length} closed
                      </Link>
                    )}
                  </>
                )}
              </Slot>
            </section>
          </CaseFilters>
        </div>
      </div>
    </div>
  );
}
