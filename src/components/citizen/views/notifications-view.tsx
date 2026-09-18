import Link from "next/link";
import { db } from "@/lib/db";
import { humanizeCode } from "@/lib/utils";
import type { SessionUser } from "@/types";
import { NotifHero } from "@/components/citizen/notif-hero";
import { HomeReveal } from "@/components/citizen/home-reveal";
import { GhostHero } from "@/components/citizen/ghost-hero";
import {
  ConfirmActions,
  EscalateActions,
  MarkAllRead,
  NotifSettings,
} from "@/components/citizen/notif-actions";
import { Slot } from "@/components/citizen/slot";
import { Sk, SkIn } from "@/components/citizen/skeletons";

const IC = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  cog: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" /></>,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  cam: <><path d="M3.5 8.5h3.2l1.4-2.4h7.8l1.4 2.4h3.2v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z" /><circle cx="12" cy="13.2" r="3.6" /></>,
  clk: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  chart: <path d="M4.6 19.4h14.8M7.4 19.4v-6.2M12 19.4V6.6M16.6 19.4v-9.4" />,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

/** "2h" / "3d" — the mockup's terse right-hand stamp. */
function ago(from: Date, now: number): string {
  const m = Math.max(0, Math.round((now - from.getTime()) / 60_000));
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

/** "22 HOURS LEFT" / "2 DAYS AGO" — the monospace meta line. */
function stamp(hours: number, suffix: string): string {
  const h = Math.abs(Math.round(hours));
  if (h < 48) return `${h} HOUR${h === 1 ? "" : "S"} ${suffix}`;
  return `${Math.round(h / 24)} DAYS ${suffix}`;
}

const DAY = 86_400_000;
const OPEN_STATES = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "AWAITING_INFO"];

/** Both trays in one round: the obligations and the updates are fetched together. */
export async function loadNotifications(user: SessionUser) {
  const now = Date.now();
  const [mine, items] = await Promise.all([
    db.case.findMany({
      where: { filedById: user.id, status: { not: "CLOSED" } },
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        departmentCode: true,
        slaDueAt: true,
        escalated: true,
        resolvedAt: true,
        updatedAt: true,
        assignedTo: { select: { name: true } },
        events: {
          where: { type: "INFO_REQUESTED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { message: true, createdAt: true, actor: { select: { name: true } } },
        },
      },
      orderBy: { slaDueAt: "asc" },
    }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  type Case = (typeof mine)[number];
  const needs: { kind: "confirm" | "info" | "escalate"; c: Case }[] = [
    // An officer says it is done; only the filer can close it.
    ...mine.filter((c) => c.status === "RESOLVED").map((c) => ({ kind: "confirm" as const, c })),
    // An officer cannot proceed without something from you.
    ...mine.filter((c) => c.status === "AWAITING_INFO").map((c) => ({ kind: "info" as const, c })),
    // The charter limit has lapsed and escalation has not been pulled forward.
    ...mine
      .filter((c) => OPEN_STATES.includes(c.status) && !c.escalated && c.slaDueAt.getTime() < now)
      .map((c) => ({ kind: "escalate" as const, c })),
  ];

  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const groups: { label: string; rows: typeof items }[] = [
    { label: "Today", rows: [] },
    { label: "Yesterday", rows: [] },
    { label: "This week", rows: [] },
    { label: "Earlier", rows: [] },
  ];
  for (const n of items) {
    const t = n.createdAt.getTime();
    const i =
      t >= midnight.getTime() ? 0
        : t >= midnight.getTime() - DAY ? 1
          : t >= midnight.getTime() - 7 * DAY ? 2
            : 3;
    groups[i].rows.push(n);
  }

  return {
    now,
    needs,
    items,
    unread: items.filter((n) => !n.readAt).length,
    lastWeek: items.filter((n) => now - n.createdAt.getTime() < 7 * DAY).length,
    groups: groups.filter((g) => g.rows.length > 0),
    headline:
      needs.length === 0
        ? "Nothing needs you"
        : `${["Nothing", "One thing", "Two things", "Three things", "Four things"][needs.length] ?? `${needs.length} things`} need${needs.length === 1 ? "s" : ""} you`,
  };
}

export type NotifData = Awaited<ReturnType<typeof loadNotifications>>;

/** Rows in the shape of a notification: icon tile, title, a two-line body. */
function NRowsSkeleton({ n }: { n: number }) {
  return (
    <div aria-busy aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="nrow">
          <span className="nic nu" />
          <div className="nb2">
            <div className="nt"><Sk w="68%" /></div>
            <div className="ns"><Sk w="94%" /><Sk w="58%" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Notifications. Rendered from loading.tsx with `data={null}` — see Slot. */
export function NotificationsView({ data }: { data: Promise<NotifData> | null }) {
  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <header className="top">
          <div className="row">
            <Link href="/" className="backbtn" aria-label="Back">
              <Icon d="back" sw={1.9} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="greet" style={{ fontSize: "17px" }}>Notifications</div>
              <div className="ward">
                <Slot data={data} fallback={<SkIn w="1ch" />}>{(d) => d.needs.length}</Slot> need you ·{" "}
                <Slot data={data} fallback={<SkIn w="5em" />}>
                  {(d) => <>{d.items.length} update{d.items.length === 1 ? "" : "s"}</>}
                </Slot>
              </div>
            </div>
            <Link href="/profile" className="bell" aria-label="Notification settings">
              <Icon d="cog" />
            </Link>
          </div>
        </header>

        <Slot data={data} fallback={<GhostHero kind="bench" />}>
          {(d) => <NotifHero needs={d.needs.length} updates={Math.min(d.items.length, 12)} />}
        </Slot>

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">Sorted by what it asks of you</div>
            <h1 className="dspl"><Slot data={data} fallback={<Sk w="68%" />}>{(d) => d.headline}</Slot></h1>
            <p className="lede">
              Anything that needs a decision stands in the first tray and{" "}
              <b>stays there until you act</b>. Everything else is filed flat — you
              can clear all of it in one tap without losing an obligation.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Needs you</div>
              <div className="sv">
                <Slot data={data} fallback={<Sk w="2ch" />}>
                  {(d) => <span style={{ color: d.needs.length ? "var(--warn)" : undefined }}>{d.needs.length}</span>}
                </Slot>
              </div>
              <div className="sd">awaiting action</div>
            </div>
            <div>
              <div className="sk">Updates</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.lastWeek}</Slot></div>
              <div className="sd">last 7 days</div>
            </div>
            <div>
              <div className="sk">Unread</div>
              <div className="sv"><Slot data={data} fallback={<Sk w="2ch" />}>{(d) => d.unread}</Slot></div>
              <div className="sd">to clear</div>
            </div>
          </div>

          <Slot
            data={data}
            fallback={
              <section className="reveal" data-d="0">
                <div className="sh"><b>Needs you</b><span><SkIn w="3em" /></span></div>
                <div className="urgent"><NRowsSkeleton n={2} /></div>
              </section>
            }
          >
            {(d) =>
              d.needs.length > 0 && (
                <section className="reveal" data-d="0">
                  <div className="sh">
                    <b>Needs you</b>
                    <span>{d.needs.length} item{d.needs.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="urgent">
                    {d.needs.map(({ kind, c }) => {
                      const dept = humanizeCode(c.departmentCode).toUpperCase();
                      if (kind === "confirm") {
                        const since = (d.now - (c.resolvedAt ?? c.updatedAt).getTime()) / 3_600_000;
                        return (
                          <div className="nrow slot" key={`c-${c.id}`}>
                            <span className="nic ok"><Icon d="chk2" sw={2.4} /></span>
                            <div className="nb2">
                              <div className="nt">Confirm {c.title.toLowerCase()} is fixed</div>
                              <div className="ns">
                                {c.assignedTo?.name ?? "The department"} marked {c.number} resolved.
                                It closes only when you confirm — if it isn&rsquo;t actually
                                fixed, reopening keeps the original clock.
                              </div>
                              <div className="nm2">{c.number} · {dept} · {stamp(since, "AGO")}</div>
                              <ConfirmActions caseId={c.id} />
                            </div>
                          </div>
                        );
                      }
                      if (kind === "info") {
                        const ev = c.events[0];
                        const since = ev ? (d.now - ev.createdAt.getTime()) / 3_600_000 : 0;
                        return (
                          <div className="nrow slot" key={`i-${c.id}`}>
                            <span className="nic wn"><Icon d="cam" /></span>
                            <div className="nb2">
                              <div className="nt">{ev?.actor?.name ?? "An officer"} asked for more detail</div>
                              <div className="ns">
                                {ev?.message
                                  ? `“${ev.message}”`
                                  : "The department needs something more before it can proceed."}
                              </div>
                              <div className="nm2">
                                {c.number} · {dept}
                                {ev ? ` · ${stamp(since, "AGO")}` : ""}
                              </div>
                              <div className="nacts">
                                <Link href={`/cases/${c.id}`} className="btn p">Add a photo</Link>
                                <Link href={`/cases/${c.id}`} className="btn s">Reply</Link>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      const over = (d.now - c.slaDueAt.getTime()) / 3_600_000;
                      return (
                        <div className="nrow slot" key={`e-${c.id}`}>
                          <span className="nic dg"><Icon d="clk" sw={1.9} /></span>
                          <div className="nb2">
                            <div className="nt">{c.title} is past its charter limit</div>
                            <div className="ns">
                              {c.number} passed the time the charter allows. It escalates on
                              its own, or you can pull the escalation forward now.
                            </div>
                            <div className="nm2">{c.number} · {dept} · {stamp(over, "OVER")}</div>
                            <EscalateActions caseId={c.id} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            }
          </Slot>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Updates</b>
              <span>Nothing to do</span>
            </div>
            <Slot
              data={data}
              fallback={
                <>
                  <div className="grp"><Sk w="5em" /></div>
                  <NRowsSkeleton n={3} />
                </>
              }
            >
              {(d) =>
                d.items.length === 0 ? (
                  <p className="lede">Nothing yet. Updates land here when a case of yours moves.</p>
                ) : (
                  <>
                    {d.groups.map((g) => (
                      <div key={g.label}>
                        <div className="grp">{g.label}</div>
                        {g.rows.map((n) => {
                          // Reputation notices point at the profile; everything else
                          // is a case update, which the mockup files bare.
                          const badge = n.link === "/profile";
                          return (
                            <div className="nrow slot" key={n.id}>
                              {badge ? (
                                <span className="nic nu" style={{ width: 30, height: 30 }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                                    {IC.chart}
                                  </svg>
                                </span>
                              ) : !n.readAt ? (
                                <span className="dot" />
                              ) : null}
                              <div className="nb2" style={!badge && n.readAt ? { marginLeft: 19 } : undefined}>
                                <div className="nt">{n.link ? <Link href={n.link}>{n.title}</Link> : n.title}</div>
                                <div className="ns">{n.body}</div>
                              </div>
                              <span className="when">{ago(n.createdAt, d.now)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {d.unread > 0 && <MarkAllRead count={d.unread} />}
                  </>
                )
              }
            </Slot>
          </section>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>What you get told about</b>
              <span>Settings</span>
            </div>
            <NotifSettings />
          </section>
        </div>
      </div>
    </div>
  );
}
