import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { ThemedHero } from "@/components/art/themed-hero";
import { VoiceMicButton } from "@/components/citizen/voice-capture";
import { SlaBar } from "@/components/primitives/sla-bar";
import { StatusBadge } from "@/components/case/status-badge";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { getT } from "@/lib/t";
import type { CaseStatus } from "@/types";

const CHIPS = ["Water", "Roads", "Garbage", "Power", "Drains"];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}

export default async function CitizenHome() {
  const user = await requireRole(["CITIZEN"]);
  const wardCode = user.wardCode ?? "";

  const [caseCount, resolvedCount, recent, wardCases, rankAbove] =
    await Promise.all([
      db.case.count({ where: { filedById: user.id } }),
      db.case.count({
        where: { filedById: user.id, status: { in: ["RESOLVED", "CLOSED"] } },
      }),
      db.case.findMany({
        // Active cases, sorted BY TIME LEFT (invariant 4).
        where: { filedById: user.id, status: { notIn: ["RESOLVED", "CLOSED"] } },
        orderBy: { slaDueAt: "asc" },
        take: 3,
        select: {
          id: true,
          number: true,
          title: true,
          status: true,
          categoryId: true,
          createdAt: true,
          slaDueAt: true,
        },
      }),
      db.case.findMany({
        where: { wardCode },
        select: { status: true, createdAt: true, resolvedAt: true },
      }),
      db.user.count({
        where: { role: "CITIZEN", reputation: { gt: user.reputation } },
      }),
    ]);

  const t = getT(user.language ?? "en");
  const firstName = user.name.split(" ")[0];
  const wardName = WARDS.find((w) => w.code === wardCode)?.name ?? wardCode;

  // Ward pulse
  const wardTotal = wardCases.length;
  const wardResolved = wardCases.filter(
    (c) => c.status === "RESOLVED" || c.status === "CLOSED",
  );
  const wardResolvedPct = wardTotal
    ? Math.round((wardResolved.length / wardTotal) * 100)
    : 0;
  const days = wardResolved
    .filter((c) => c.resolvedAt)
    .map(
      (c) => (c.resolvedAt!.getTime() - c.createdAt.getTime()) / 86_400_000,
    )
    .sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : 0;
  const rank = rankAbove + 1;
  const month = new Date().toLocaleString("en", { month: "long" });

  return (
    <div className="mk flex flex-col gap-3">
      {/* greeting */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <div className="font-display text-[19px] font-semibold">
            नमस्ते, {firstName}
          </div>
          <div className="t2">Ward {wardName}</div>
        </div>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="grid h-8 w-8 place-items-center rounded-lg border"
          style={{ borderColor: "var(--u-line)", color: "var(--u-muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 21a2.5 2.5 0 0 0 5 0"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>

      {/* hero band */}
      <div className="hero" style={{ height: 180 }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <ThemedHero height={180} />
        </div>
        {/* bottom scrim for legible overlay text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.6), transparent 58%)",
          }}
          aria-hidden
        />
        <div className="ov">
          <div className="ht dis">Raise your voice</div>
          <div className="hs">
            {resolvedCount} of {caseCount} reports were resolved this year
          </div>
        </div>
      </div>

      {/* CTA card */}
      <div className="card">
        <div className="cb">
          <div style={{ display: "flex", gap: 9 }}>
            <Link href="/file" className="btn p" style={{ flex: 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
              File a complaint
            </Link>
            <VoiceMicButton ariaLabel={t("home.voiceInput")} />
          </div>
          <div className="chips" style={{ marginTop: 10 }}>
            {CHIPS.map((c) => (
              <Link key={c} href="/file" className="chip">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* active cases */}
      <div className="card">
        <div className="ch">
          <b>Your active cases</b>
          <span className="m">BY TIME LEFT</span>
        </div>
        {recent.length === 0 ? (
          <div className="cb t2">No active cases. File one to start tracking.</div>
        ) : (
          recent.map((c) => {
            const created = c.createdAt.getTime();
            const limitDays = Math.max(
              1,
              Math.round((c.slaDueAt.getTime() - created) / 86_400_000),
            );
            const elapsedHours = (Date.now() - created) / 3_600_000;
            const catName =
              CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? "—";
            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="row"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <div className="mn">
                  <div className="t1">{c.title}</div>
                  <div className="t2 mono">
                    {c.number} · {catName}
                  </div>
                  <div style={{ marginTop: 7 }}>
                    <SlaBar elapsedHours={elapsedHours} limitDays={limitDays} />
                  </div>
                </div>
                <div className="rt">
                  <StatusBadge status={c.status as CaseStatus} />
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* ward pulse */}
      <div className="card">
        <div className="ch">
          <b>Ward pulse · {month}</b>
          <span className="m">n={wardTotal}</span>
        </div>
        <div className="cb">
          <div className="grid3">
            <div>
              <div className="k">Resolved</div>
              <div className="v" style={{ fontSize: "22px" }}>
                {wardResolvedPct}
                <small>%</small>
              </div>
            </div>
            <div>
              <div className="k">Median</div>
              <div className="v" style={{ fontSize: "22px" }}>
                {median.toFixed(1)}
                <small>d</small>
              </div>
            </div>
            <div>
              <div className="k">Your rank</div>
              <div className="v" style={{ fontSize: "22px" }}>
                {rank}
                <small>{ordinal(rank)}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
