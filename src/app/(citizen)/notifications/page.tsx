import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { humanizeCode } from "@/lib/utils";
import { NotifHero } from "@/components/citizen/notif-hero";
import { HomeReveal } from "@/components/citizen/home-reveal";
import {
  ConfirmActions,
  EscalateActions,
  MarkAllRead,
  NotifSettings,
} from "@/components/citizen/notif-actions";

const IC = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  cog: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" /></>,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  cam: <><path d="M3.5 8.5h3.2l1.4-2.4h7.8l1.4 2.4h3.2v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z" /><circle cx="12" cy="13.2" r="3.6" /></>,
  clk: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  chart: <path d="M4.6 19.4h14.8M7.4 19.4v-6.2M12 19.4V6.6M16.6 19.4v-9.4" />,
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" />,
  feed: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M7 9h6M7 13h10M7 16h7" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
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

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const now = Date.now();

  // ---- the first tray: things that ask a decision of you ----
  const mine = await db.case.findMany({
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
  });

  type Need =
    | { kind: "confirm"; c: (typeof mine)[number] }
    | { kind: "info"; c: (typeof mine)[number] }
    | { kind: "escalate"; c: (typeof mine)[number] };

  const needs: Need[] = [
    // An officer says it is done; only the filer can close it.
    ...mine.filter((c) => c.status === "RESOLVED").map((c) => ({ kind: "confirm" as const, c })),
    // An officer cannot proceed without something from you.
    ...mine.filter((c) => c.status === "AWAITING_INFO").map((c) => ({ kind: "info" as const, c })),
    // The charter limit has lapsed and escalation has not been pulled forward.
    ...mine
      .filter(
        (c) =>
          OPEN_STATES.includes(c.status) &&
          !c.escalated &&
          c.slaDueAt.getTime() < now,
      )
      .map((c) => ({ kind: "escalate" as const, c })),
  ];

  // ---- the second tray: things that merely happened ----
  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = items.filter((n) => !n.readAt).length;
  const lastWeek = items.filter((n) => now - n.createdAt.getTime() < 7 * DAY).length;

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
      t >= midnight.getTime()
        ? 0
        : t >= midnight.getTime() - DAY
          ? 1
          : t >= midnight.getTime() - 7 * DAY
            ? 2
            : 3;
    groups[i].rows.push(n);
  }

  const headline =
    needs.length === 0
      ? "Nothing needs you"
      : `${["Nothing", "One thing", "Two things", "Three things", "Four things"][needs.length] ?? `${needs.length} things`} need${needs.length === 1 ? "s" : ""} you`;

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
                {needs.length} need you · {items.length} update{items.length === 1 ? "" : "s"}
              </div>
            </div>
            <Link href="/profile" className="bell" aria-label="Notification settings">
              <Icon d="cog" />
            </Link>
          </div>
        </header>

        <NotifHero needs={needs.length} updates={Math.min(items.length, 12)} />

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">Sorted by what it asks of you</div>
            <h1 className="dspl">{headline}</h1>
            <p className="lede">
              Anything that needs a decision stands in the first tray and{" "}
              <b>stays there until you act</b>. Everything else is filed flat — you
              can clear all of it in one tap without losing an obligation.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Needs you</div>
              <div className="sv" style={{ color: needs.length ? "var(--warn)" : undefined }}>
                {needs.length}
              </div>
              <div className="sd">awaiting action</div>
            </div>
            <div>
              <div className="sk">Updates</div>
              <div className="sv">{lastWeek}</div>
              <div className="sd">last 7 days</div>
            </div>
            <div>
              <div className="sk">Unread</div>
              <div className="sv">{unread}</div>
              <div className="sd">to clear</div>
            </div>
          </div>

          {needs.length > 0 && (
            <section className="reveal" data-d="0">
              <div className="sh">
                <b>Needs you</b>
                <span>{needs.length} item{needs.length === 1 ? "" : "s"}</span>
              </div>
              <div className="urgent">
                {needs.map(({ kind, c }) => {
                  const dept = humanizeCode(c.departmentCode).toUpperCase();
                  if (kind === "confirm") {
                    const since = (now - (c.resolvedAt ?? c.updatedAt).getTime()) / 3_600_000;
                    return (
                      <div className="nrow" key={`c-${c.id}`}>
                        <span className="nic ok"><Icon d="chk2" sw={2.4} /></span>
                        <div className="nb2">
                          <div className="nt">Confirm {c.title.toLowerCase()} is fixed</div>
                          <div className="ns">
                            {c.assignedTo?.name ?? "The department"} marked {c.number} resolved.
                            It closes only when you confirm — if it isn&rsquo;t actually
                            fixed, reopening keeps the original clock.
                          </div>
                          <div className="nm2">
                            {c.number} · {dept} · {stamp(since, "AGO")}
                          </div>
                          <ConfirmActions caseId={c.id} />
                        </div>
                      </div>
                    );
                  }
                  if (kind === "info") {
                    const ev = c.events[0];
                    const since = ev ? (now - ev.createdAt.getTime()) / 3_600_000 : 0;
                    return (
                      <div className="nrow" key={`i-${c.id}`}>
                        <span className="nic wn"><Icon d="cam" /></span>
                        <div className="nb2">
                          <div className="nt">
                            {ev?.actor?.name ?? "An officer"} asked for more detail
                          </div>
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
                  const over = (now - c.slaDueAt.getTime()) / 3_600_000;
                  return (
                    <div className="nrow" key={`e-${c.id}`}>
                      <span className="nic dg"><Icon d="clk" sw={1.9} /></span>
                      <div className="nb2">
                        <div className="nt">{c.title} is past its charter limit</div>
                        <div className="ns">
                          {c.number} passed the time the charter allows. It escalates on
                          its own, or you can pull the escalation forward now.
                        </div>
                        <div className="nm2">
                          {c.number} · {dept} · {stamp(over, "OVER")}
                        </div>
                        <EscalateActions caseId={c.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>Updates</b>
              <span>Nothing to do</span>
            </div>

            {items.length === 0 ? (
              <p className="lede">
                Nothing yet. Updates land here when a case of yours moves.
              </p>
            ) : (
              <>
                {groups
                  .filter((g) => g.rows.length > 0)
                  .map((g) => (
                    <div key={g.label}>
                      <div className="grp">{g.label}</div>
                      {g.rows.map((n) => {
                        // Reputation notices point at the profile; everything else
                        // is a case update, which the mockup files bare.
                        const badge = n.link === "/profile";
                        return (
                          <div className="nrow" key={n.id}>
                            {badge ? (
                              <span className="nic nu" style={{ width: 30, height: 30 }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                                  {IC.chart}
                                </svg>
                              </span>
                            ) : !n.readAt ? (
                              <span className="dot" />
                            ) : null}
                            <div
                              className="nb2"
                              style={!badge && n.readAt ? { marginLeft: 19 } : undefined}
                            >
                              <div className="nt">
                                {n.link ? <Link href={n.link}>{n.title}</Link> : n.title}
                              </div>
                              <div className="ns">{n.body}</div>
                            </div>
                            <span className="when">{ago(n.createdAt, now)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                {unread > 0 && <MarkAllRead count={unread} />}
              </>
            )}
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

      <nav className="nav">
        <Link href="/" className="nb on"><Icon d="home" /><b>Home</b></Link>
        <Link href="/feed" className="nb"><Icon d="feed" /><b>Feed</b></Link>
        <Link href="/file" className="nb fab" aria-label="File a complaint">
          <div className="f"><Icon d="plus" sw={2.2} /></div>
        </Link>
        <Link href="/cases" className="nb"><Icon d="list" /><b>Cases</b></Link>
        <Link href="/profile" className="nb"><Icon d="user" /><b>Profile</b></Link>
      </nav>
    </div>
  );
}
