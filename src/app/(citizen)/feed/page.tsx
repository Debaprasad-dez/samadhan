import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { initials } from "@/lib/utils";
import { FeedHero } from "@/components/citizen/feed-hero";
import { FeedSort, PostActions } from "@/components/citizen/feed-actions";
import { HomeReveal } from "@/components/citizen/home-reveal";
import type { NearItem } from "@/lib/art/radius-map";

const IC = {
  bell: <><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  clk: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  pinmk: <><path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.4" /></>,
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

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** Stable hash → the pseudo-geo used for the radius map and distance labels.
 *  The data model has no coordinates, so a case's position on the disc is
 *  derived deterministically from its id: same case, same spot, every render. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

const AV_TONES = ["var(--brand)", "var(--ok)", "var(--warn)", "var(--danger)"];

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const user = await requireRole(["CITIZEN"]);
  const { sort = "near" } = await searchParams;
  const wardCode = user.wardCode ?? "";

  const openStates = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "AWAITING_INFO", "ESCALATED"];
  const wantResolved = sort === "done";

  const [rows, unread, closedCount, openCount, myCosigns] = await Promise.all([
    db.case.findMany({
      where: {
        wardCode,
        isPublic: true,
        status: wantResolved ? { in: ["RESOLVED", "CLOSED"] } : { in: openStates },
      },
      orderBy: sort === "new" ? { createdAt: "desc" } : { slaDueAt: "asc" },
      take: 24,
      select: {
        id: true, number: true, title: true, body: true, status: true, categoryId: true,
        createdAt: true, slaDueAt: true, filedById: true,
        _count: { select: { upvotes: true, cosigns: true } },
        cosigns: { take: 3, select: { user: { select: { name: true } } } },
        upvotes: { where: { userId: user.id }, select: { id: true } },
      },
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.case.count({ where: { wardCode, status: { in: ["RESOLVED", "CLOSED"] } } }),
    db.case.count({ where: { wardCode, status: { in: openStates } } }),
    db.cosign.findMany({ where: { userId: user.id }, select: { caseId: true } }),
  ]);

  const cosignedIds = new Set(myCosigns.map((c) => c.caseId));
  const now = Date.now();
  const wardName = WARDS.find((w) => w.code === wardCode)?.name ?? wardCode;

  // Give every case a stable position on the disc + a metre distance.
  const withGeo = rows.map((c) => {
    const r = 0.15 + hash(c.id) * 0.8;
    const t = hash(c.id + "b") * Math.PI * 2 - Math.PI;
    const over = c.slaDueAt.getTime() < now;
    const limitDays = Math.max(1, Math.round((c.slaDueAt.getTime() - c.createdAt.getTime()) / 86_400_000));
    const dayOf = Math.min(limitDays, Math.max(1, Math.ceil((now - c.createdAt.getTime()) / 86_400_000)));
    return {
      c,
      r,
      t,
      metres: Math.round((r * 500) / 10) * 10,
      over,
      limitDays,
      dayOf,
      overDays: Math.max(0, Math.round((now - c.slaDueAt.getTime()) / 86_400_000)),
    };
  });

  // "Near you" is the default; most-co-signed re-sorts by support.
  const sorted =
    sort === "hot"
      ? [...withGeo].sort((a, b) => b.c._count.cosigns - a.c._count.cosigns)
      : sort === "near"
        ? [...withGeo].sort((a, b) => a.metres - b.metres)
        : withGeo;

  const posts = sorted.slice(0, 8);
  const needSupport = withGeo.filter((x) => x.c._count.cosigns < 5).length;

  const yard: NearItem[] = withGeo.slice(0, 6).map((x) => ({
    id: x.c.number,
    r: x.r,
    t: x.t,
    co: x.c._count.cosigns,
    st: x.over ? "over" : x.dayOf / x.limitDays > 0.6 ? "warn" : "ok",
  }));

  const headline =
    openCount === 0
      ? "All quiet nearby"
      : `${WORDS[openCount] ?? openCount} nearby`;

  const SORT_LABEL: Record<string, string> = {
    near: "Sorted by distance",
    hot: "Sorted by support",
    new: "Newest first",
    done: "Recently resolved",
  };

  return (
    <div className="chome">
      <HomeReveal />
      <div className="shell">
        <header className="top">
          <div className="row">
            <div>
              <div className="greet">Ward feed</div>
              <div className="ward">{wardName} · {openCount} open within 500 m</div>
            </div>
            <Link href="/notifications" className="bell" aria-label={`${unread} notifications`}>
              <Icon d="bell" />
              {unread > 0 && <b>{unread}</b>}
            </Link>
          </div>
        </header>

        <FeedHero items={yard} />

        <div className="wrap">
          <div className="reveal" data-d="0">
            <div className="eyebrow">Within 500 m · {posts.length} shown</div>
            <h1 className="dspl">{headline}</h1>
            <p className="lede">
              Each stack on the map is one chip per four neighbours who{" "}
              <b>co-signed</b> a case. Co-signed cases close faster — so adding
              your name is usually worth more than filing again.
            </p>
          </div>

          <div className="stats reveal" data-d="1">
            <div>
              <div className="sk">Open nearby</div>
              <div className="sv">{openCount}</div>
              <div className="sd">within 500 m</div>
            </div>
            <div>
              <div className="sk">Need support</div>
              <div className="sv">{needSupport}</div>
              <div className="sd">under 5 co-signs</div>
            </div>
            <div>
              <div className="sk">Closed</div>
              <div className="sv">{closedCount}</div>
              <div className="sd">all time</div>
            </div>
          </div>

          <div className="reveal" data-d="2">
            <FeedSort active={sort} />
          </div>

          <section className="reveal" data-d="0">
            <div className="sh">
              <b>{sort === "done" ? "Resolved" : sort === "hot" ? "Most co-signed" : sort === "new" ? "Newest" : "Near you"}</b>
              <span>{SORT_LABEL[sort] ?? SORT_LABEL.near}</span>
            </div>

            {posts.length === 0 ? (
              <div className="post">
                <div className="t">Nothing here yet</div>
                <p className="q">No public cases in your ward for this filter.</p>
              </div>
            ) : (
              posts.map(({ c, metres, over, limitDays, dayOf, overDays }) => {
                const cat = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? "—";
                const resolved = c.status === "RESOLVED" || c.status === "CLOSED";
                const extra = resolved
                  ? `closed in ${Math.max(1, Math.round((now - c.createdAt.getTime()) / 86_400_000))}d`
                  : over
                    ? `${overDays} day${overDays === 1 ? "" : "s"} over limit`
                    : `day ${dayOf} of ${limitDays}`;
                const others = Math.max(0, c._count.cosigns - c.cosigns.length);
                return (
                  <div key={c.id} className="post">
                    <div className="hd">
                      <div>
                        <Link href={`/cases/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                          <div className="t">{c.title}</div>
                        </Link>
                        <div className="m">
                          {cat} · <b>{metres} m</b> away · {extra}
                        </div>
                      </div>
                      <span className={`pill ${resolved ? "ok" : over ? "dg" : "wn"}`}>
                        <Icon d={resolved ? "chk2" : over ? "up" : "clk"} sw={resolved ? 2.4 : over ? 2.3 : 1.9} />
                        {resolved ? "Resolved" : over ? "Escalated" : "In progress"}
                      </span>
                    </div>

                    <p className="q">&ldquo;{c.body.slice(0, 140).trim()}&rdquo;</p>

                    {c._count.cosigns > 0 && (
                      <div className="faces">
                        <div className="stackav">
                          {c.cosigns.map((cs, i) => (
                            <i key={i} style={{ background: AV_TONES[i % AV_TONES.length] }}>
                              {initials(cs.user.name)}
                            </i>
                          ))}
                          {others > 0 && <i style={{ background: "var(--muted)" }}>+{others}</i>}
                        </div>
                        <span className="cnt">
                          <b>{c._count.cosigns}</b> neighbour
                          {c._count.cosigns === 1 ? "" : "s"} co-signed
                          {c._count.cosigns < 5 && <> · <b>needs support</b></>}
                        </span>
                      </div>
                    )}

                    <PostActions
                      caseId={c.id}
                      upvotes={c._count.upvotes}
                      viewerUpvoted={c.upvotes.length > 0}
                      isOwn={c.filedById === user.id}
                      viewerCosigned={cosignedIds.has(c.id)}
                    />
                  </div>
                );
              })
            )}
          </section>

          <section className="reveal" data-d="0">
            <div className="endcard">
              <span style={{ color: "var(--muted)", display: "inline-block", width: 22, height: 22 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                  <path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" />
                  <circle cx="12" cy="10.5" r="2.4" />
                </svg>
              </span>
              <div className="t2" style={{ marginTop: 9 }}>That&rsquo;s everything within 500 m</div>
              <div className="s3">
                Widen the radius to see the rest of Ward {wardName}, or switch to
                the heatmap for the whole picture.
              </div>
              <Link href={`/ward/${wardCode}`} className="btn s" style={{ marginTop: 14, width: "100%" }}>
                See the ward heatmap
              </Link>
            </div>
          </section>
        </div>
      </div>

      <nav className="nav">
        <Link href="/" className="nb"><Icon d="home" /><b>Home</b></Link>
        <Link href="/feed" className="nb on"><Icon d="feed" /><b>Feed</b></Link>
        <Link href="/file" className="nb fab" aria-label="File a complaint">
          <div className="f"><Icon d="plus" sw={2.2} /></div>
        </Link>
        <Link href="/cases" className="nb"><Icon d="list" /><b>Cases</b></Link>
        <Link href="/profile" className="nb"><Icon d="user" /><b>Profile</b></Link>
      </nav>
    </div>
  );
}
