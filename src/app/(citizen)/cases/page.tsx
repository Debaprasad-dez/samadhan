import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { CasesHero } from "@/components/citizen/cases-hero";
import { CaseFilters } from "@/components/citizen/case-filters";
import { ConfirmFix } from "@/components/citizen/confirm-fix";
import { HomeReveal } from "@/components/citizen/home-reveal";
import type { YardCase } from "@/lib/art/limit-yard";

const IC = {
  bell: <><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  clk: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  chev: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
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

/** "3d 20h" from hours. */
function dh(hours: number): string {
  const h = Math.max(0, Math.round(hours));
  return `${Math.floor(h / 24)}d ${String(h % 24).padStart(2, "0")}h`;
}

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export default async function CasesPage() {
  const user = await requireRole(["CITIZEN"]);

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
  const openStates = new Set(["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "AWAITING_INFO", "ESCALATED"]);
  const active = all.filter((c) => openStates.has(c.status));
  const awaiting = all.filter((c) => c.status === "RESOLVED");
  const closed = all.filter((c) => c.status === "CLOSED");
  const pastLimit = active.filter((c) => c.slaDueAt.getTime() < now).length;
  const wardName = WARDS.find((w) => w.code === user.wardCode)?.name ?? user.wardCode ?? "—";

  const limitDaysOf = (c: { createdAt: Date; slaDueAt: Date }) =>
    Math.max(1, Math.round((c.slaDueAt.getTime() - c.createdAt.getTime()) / 86_400_000));

  // Hero columns: elapsed / limit for up to six of the most pressing cases.
  const yard: YardCase[] = [...active, ...awaiting].slice(0, 6).map((c) => {
    const limitH = limitDaysOf(c) * 24;
    const elapsedH = ((c.resolvedAt ?? new Date(now)).getTime() - c.createdAt.getTime()) / 3_600_000;
    return { id: c.number, frac: limitH > 0 ? elapsedH / limitH : 0 };
  });

  const headline = pastLimit === 0
    ? "All inside the ceiling"
    : `${WORDS[pastLimit] ?? pastLimit} broke the ceiling`;

  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <header className="top">
          <div className="row">
            <div>
              <div className="greet">Your cases</div>
              <div className="ward">
                Ward {wardName} · {active.length} open
                {pastLimit > 0 ? `, ${pastLimit} past its limit` : ""}
              </div>
            </div>
            <Link href="/notifications" className="bell" aria-label={`${unread} notifications`}>
              <Icon d="bell" />
              {unread > 0 && <b>{unread}</b>}
            </Link>
          </div>
        </header>

        <CasesHero cases={yard} />

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">
              {all.length} case{all.length === 1 ? "" : "s"} · elapsed against limit
            </div>
            <h1 className="dspl">{headline}</h1>
            <p className="lede">
              Every column is one case, scaled against <b>its own charter limit</b> —
              so a 24-hour power fault and a 10-day road repair stand side by side
              honestly. Anything through the glass has escalated on its own.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Open</div>
              <div className="sv">{active.length}</div>
              <div className="sd">{awaiting.length} need you</div>
            </div>
            <div>
              <div className="sk">Past limit</div>
              <div className="sv" style={{ color: pastLimit ? "var(--danger)" : undefined }}>{pastLimit}</div>
              <div className="sd">escalated</div>
            </div>
            <div>
              <div className="sk">Closed</div>
              <div className="sv">{closed.length}</div>
              <div className="sd">all time</div>
            </div>
          </div>

          <CaseFilters
            counts={{ active: active.length, await: awaiting.length, closed: closed.length }}
          >
            <section className="reveal" data-sec="active" data-d="0">
              <div className="sh"><b>Active</b><span>Sorted by time left</span></div>
              {active.length === 0 ? (
                <div className="crow"><div className="body2"><div className="t">Nothing open</div>
                  <div className="m">FILE A COMPLAINT TO START TRACKING</div></div></div>
              ) : (
                active.map((c) => {
                  const limitDays = limitDaysOf(c);
                  const elapsedH = (now - c.createdAt.getTime()) / 3_600_000;
                  const remainH = (c.slaDueAt.getTime() - now) / 3_600_000;
                  const over = remainH < 0;
                  const w = Math.min(100, Math.round((elapsedH / (limitDays * 24)) * 78));
                  const cat = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? c.departmentCode;
                  return (
                    <Link key={c.id} href={`/cases/${c.id}`} className="crow">
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
              )}
            </section>

            <section className="reveal" data-sec="await" data-d="0">
              <div className="sh">
                <b>Awaiting you</b>
                <span>{awaiting.length} item{awaiting.length === 1 ? "" : "s"}</span>
              </div>
              {awaiting.length === 0 ? (
                <div className="crow"><div className="body2"><div className="t">Nothing to confirm</div>
                  <div className="m">WE&rsquo;LL ASK WHEN A CASE IS MARKED RESOLVED</div></div></div>
              ) : (
                awaiting.map((c) => (
                  <div key={c.id} className="note2">
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
              )}
            </section>

            <section className="reveal closed" data-sec="closed" data-d="0">
              <div className="sh"><b>Recently closed</b><span>Outcome · time</span></div>
              {closed.length === 0 ? (
                <div className="crow"><div className="body2"><div className="t">Nothing closed yet</div>
                  <div className="m">RESOLVED CASES LAND HERE</div></div></div>
              ) : (
                closed.slice(0, 3).map((c) => {
                  const limitDays = limitDaysOf(c);
                  const end = (c.closedAt ?? c.resolvedAt ?? c.slaDueAt).getTime();
                  const tookH = (end - c.createdAt.getTime()) / 3_600_000;
                  const late = tookH > limitDays * 24;
                  const when = (c.closedAt ?? c.resolvedAt ?? c.createdAt)
                    .toLocaleString("en", { day: "2-digit", month: "short" })
                    .toUpperCase();
                  return (
                    <Link key={c.id} href={`/cases/${c.id}`} className="crow">
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
              {closed.length > 3 && (
                <Link href="/feed" className="btn s w" style={{ marginTop: 16 }}>
                  See all {closed.length} closed
                </Link>
              )}
            </section>
          </CaseFilters>
        </div>
      </div>

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
