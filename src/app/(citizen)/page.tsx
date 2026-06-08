import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { tierForScore } from "@/lib/reputation";
import { ThemedHero } from "@/components/art/themed-hero";
import { marigold, leaf } from "@/lib/art/core";
import { cn } from "@/lib/utils";

// Floating marigold-and-leaf sprig (design handoff decorate()) — perches over the
// CTA card's top-right corner; the .bloom class gives it a gentle sway.
const SPRIG = `${leaf(64, 22)}${leaf(22, 40)}${marigold(36, 30, 12, false)}${marigold(62, 40, 9, false)}${marigold(50, 22, 7, true)}`;

function slaPercent(status: string): number {
  if (status === "FILED") return 10;
  if (status === "IN_PROGRESS") return 65;
  if (status === "OFFICER_ASSIGNED") return 30;
  if (status === "RESOLVED" || status === "REJECTED" || status === "CLOSED") return 100;
  return 15;
}

function SlaRing({ percent, status }: { percent: number; status: string }) {
  const r = 15;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(percent, 100) / 100);
  const isWarn = status === "IN_PROGRESS" || status === "FILED" || status === "PENDING";
  const stroke = isWarn ? "var(--g-warn)" : "var(--g-ok)";
  return (
    <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden>
      <circle cx="18" cy="18" r={r} fill="none" stroke="var(--g-line)" strokeWidth="4" />
      <circle
        cx="18" cy="18" r={r}
        fill="none" stroke={stroke} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 18 18)"
      />
      <text x="18" y="21.5" textAnchor="middle" fontSize="9.5" fontWeight="700"
        fill={stroke} fontFamily="var(--font-mukta,system-ui)">
        {percent}%
      </text>
    </svg>
  );
}

const STATUS_LABEL: Record<string, string> = {
  FILED: "Filed", IN_PROGRESS: "In progress",
  OFFICER_ASSIGNED: "Officer assigned", RESOLVED: "Resolved",
  REJECTED: "Rejected", PENDING: "Pending", CLOSED: "Closed",
};

// Category thumb gradients are semantic (per department), not per-theme.
const THUMB_STYLE: Record<string, { bg: string; color: string }> = {
  WATER:       { bg: "linear-gradient(150deg,#D9EEF0,#A9D4D8)", color: "#1F6E73" },
  ELECTRICITY: { bg: "linear-gradient(150deg,#FBE7C4,#F1C57E)", color: "#A8650F" },
  ROADS:       { bg: "linear-gradient(150deg,#E0E4F0,#B8C2DC)", color: "#3A4A88" },
  SANITATION:  { bg: "linear-gradient(150deg,#D9F0E4,#A9D8BC)", color: "#1F6E4A" },
  HEALTH:      { bg: "linear-gradient(150deg,#F0D9E4,#D8A9BC)", color: "#6E1F3A" },
  EDUCATION:   { bg: "linear-gradient(150deg,#EAD9F0,#C8A9D8)", color: "#5A1F6E" },
  POLICE:      { bg: "linear-gradient(150deg,#F0EDD9,#D8D0A9)", color: "#6E5A1F" },
  PUBLIC_WORKS:{ bg: "linear-gradient(150deg,#F0DED9,#D8B4A9)", color: "#6E2F1F" },
};
const THUMB_ICON: Record<string, string> = {
  WATER:       `<path d="M12 2c3.5 4.5 6 7.5 6 10.5a6 6 0 0 1-12 0C6 9.5 8.5 6.5 12 2Z" fill="currentColor"/>`,
  ELECTRICITY: `<path d="M13 2 4 14h7l-1 9 9-12h-7l1-9Z" fill="currentColor"/>`,
  ROADS:       `<path d="M6 21V8l6-4 6 4v13M6 12h12M9 12v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  SANITATION:  `<path d="M16 3l-7 7M5 21c0-4 2-6 4-8l3 3c-2 2-4 4-7 5ZM12 13l4-4 2 2-4 4Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
};

function CategoryThumb({ category }: { category: string }) {
  const s = THUMB_STYLE[category] ?? THUMB_STYLE.PUBLIC_WORKS;
  const icon = THUMB_ICON[category] ?? `<circle cx="12" cy="12" r="6" fill="currentColor"/>`;
  return (
    <div className="flex h-[46px] w-[46px] flex-none items-center justify-center overflow-hidden rounded-[13px]"
      style={{ background: s.bg, color: s.color }}>
      <svg viewBox="0 0 24 24" className="h-[23px] w-[23px]"
        dangerouslySetInnerHTML={{ __html: icon }} />
    </div>
  );
}

const CHIPS = [
  { label: "Water",       icon: `<path d="M12 2c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9Z" fill="currentColor"/>` },
  { label: "Roads",       icon: `<path d="M3 18h18M6 18l1.5-12h9L18 18M9 6v12M15 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>` },
  { label: "Garbage",     icon: `<path d="M6 9h12l-1 11H7L6 9Zm2-3h8l1 3H7l1-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none"/>` },
  { label: "Power",       icon: `<path d="M13 2 4 14h7l-1 9 9-12h-7l1-9Z" fill="currentColor"/>` },
  { label: "Streetlight", icon: `<path d="M12 3v3M12 18v3M5 12H2M22 12h-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="4" fill="currentColor"/>` },
];

export default async function CitizenHome() {
  const user = await requireRole(["CITIZEN"]);

  const [caseCount, recent, hot] = await Promise.all([
    db.case.count({ where: { filedById: user.id } }),
    db.case.findMany({
      where: { filedById: user.id },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { id: true, number: true, title: true, status: true, categoryId: true },
    }),
    db.case.findMany({
      where: { filedById: { not: user.id } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, categoryId: true, status: true, _count: { select: { cosigns: true } } },
    }),
  ]);

  const tier = tierForScore(user.reputation);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col">

      {/* ── Hero: full-bleed, break out of shell padding ──
          NOTE: the hero art is the bharat dawn scene for every theme until the
          other scenes are ported, so this overlay keeps a fixed dawn-readable
          ink rather than --g-ink (which goes light on the dark themes). */}
      <div className="relative -mx-4 md:-mx-6">
        <ThemedHero />

        <div className="absolute inset-x-6 top-14 z-[8]">
          {/* brand row */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px]"
              style={{ background: "linear-gradient(150deg,var(--g-gold-lt),var(--g-primary) 70%)", boxShadow: "0 4px 12px -3px rgba(168,60,20,.6),inset 0 1px 0 rgba(255,255,255,.4)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3c.6 2.4 2.2 4 4.6 4.6C14.2 8.2 12.6 9.8 12 12.2 11.4 9.8 9.8 8.2 7.4 7.6 9.8 7 11.4 5.4 12 3Z" fill="#fff"/>
                <path d="M5 13c1.8.4 2.9 1.5 3.3 3.3.4-1.8 1.5-2.9 3.3-3.3-1.8-.4-2.9-1.5-3.3-3.3C7.9 11.5 6.8 12.6 5 13Z" fill="#fff" opacity=".82"/>
                <path d="M15.2 14.5c1.4.3 2.2 1.1 2.5 2.5.3-1.4 1.1-2.2 2.5-2.5-1.4-.3-2.2-1.1-2.5-2.5-.3 1.4-1.1 2.2-2.5 2.5Z" fill="#fff" opacity=".66"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-lg leading-none" style={{ color: "#2c1b10" }}>समाधान</p>
              <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[2.5px]" style={{ color: "#6e5746" }}>Samadhan</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,.62)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.45)", color: "#6e5746", boxShadow: "0 4px 14px -8px rgba(40,26,12,.5)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="12" cy="10" r="2.4" fill="currentColor"/>
              </svg>
              {user.wardCode ? `Ward ${user.wardCode}` : "Samadhan"}
            </div>
          </div>

          {/* greeting with frosted veil */}
          <div className="relative mt-8">
            <div className="pointer-events-none absolute -inset-3 z-[-1]"
              style={{
                background: "radial-gradient(120% 120% at 22% 44%,rgba(251,247,238,.9) 0%,rgba(251,247,238,.7) 56%,transparent 84%)",
                backdropFilter: "blur(2.5px)",
                WebkitMaskImage: "radial-gradient(120% 120% at 26% 44%,#000 40%,transparent 82%)",
                maskImage: "radial-gradient(120% 120% at 26% 44%,#000 40%,transparent 82%)",
              }} />
            <p className="font-display text-[13px] italic" style={{ color: "#a83c14" }}>
              सुप्रभात — the city wakes
            </p>
            <h1 className="font-display text-[33px] leading-[1.06] tracking-[-0.2px]" style={{ color: "#2c1b10" }}>
              Good morning,<br />
              <span style={{ color: "#a83c14" }}>{firstName}</span>
            </h1>
            <p className="mt-2 max-w-[225px] text-[12.5px] font-medium" style={{ color: "#6e5746" }}>
              Your civic journey, tracked end to end.{" "}
              <span className="font-semibold" style={{ color: "#a83c14" }}>{tier} · {user.reputation} pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Body: overlaps hero by ~46px. All colours from --g-* → reskins per theme ── */}
      <div className="relative z-[9] -mx-4 -mt-12 flex flex-col gap-6 px-4 pb-28 md:-mx-6 md:px-6">

        {/* CTA card (+ floating marigold sprig sibling, so it isn't clipped) */}
        <div className="relative">
          <div aria-hidden
            className="pointer-events-none absolute -top-8 right-6 z-20"
            style={{ filter: "drop-shadow(0 8px 13px rgba(120,52,16,.3))" }}
            dangerouslySetInnerHTML={{ __html: `<svg width="98" height="60" viewBox="0 0 98 60">${SPRIG}</svg>` }}
          />

          <div className="relative overflow-hidden rounded-3xl p-[18px]"
            style={{
              background: "var(--g-card)",
              backdropFilter: "blur(14px) saturate(1.2)",
              border: "1px solid var(--g-line)",
              boxShadow: "0 1px 0 rgba(255,255,255,.4) inset,0 24px 50px -26px color-mix(in srgb,var(--g-primary-deep) 55%,transparent),0 8px 20px -14px rgba(20,12,6,.3)",
            }}>

            {/* watermark sun-ray */}
            <div className="pointer-events-none absolute -right-4 -bottom-5 z-0" aria-hidden>
              <svg width="132" height="132" viewBox="0 0 132 132">
                {Array.from({ length: 11 }, (_, i) => {
                  const a = (-90 + (i - 5) * 15) * (Math.PI / 180);
                  return <line key={i} x1="66" y1="97.7"
                    x2={66 + Math.cos(a) * 87} y2={97.7 + Math.sin(a) * 87}
                    stroke="var(--g-primary)" strokeOpacity="0.07" strokeWidth="1.4" strokeLinecap="round" />;
                })}
                <path d="M41 97.7 a25 25 0 0 1 50 0Z" fill="var(--g-primary)" fillOpacity=".05" />
              </svg>
            </div>

            <p className="relative z-[1] text-[10.5px] font-bold uppercase tracking-[2px]" style={{ color: "var(--g-primary)" }}>Raise your voice</p>
            <h2 className="relative z-[1] font-display text-[23px] leading-[1.1]" style={{ color: "var(--g-ink)", marginTop: 6, marginBottom: 2 }}>File a complaint</h2>
            <p className="relative z-[1] mb-4 max-w-[200px] text-[12px] leading-[1.4]" style={{ color: "var(--g-ink-soft)" }}>
              Speak in Hindi or English — our AI will phrase it for the right department.
            </p>

            <div className="relative z-[1] flex items-stretch gap-3">
              {/* btn-file */}
              <Link href="/file"
                className="relative flex flex-1 items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 transition-transform active:translate-y-0.5 active:scale-[.99]"
                style={{
                  background: "var(--g-btn-grad)",
                  color: "var(--g-btn-ink)",
                  boxShadow: "0 12px 24px -10px color-mix(in srgb,var(--g-primary-deep) 70%,transparent),inset 0 1px 0 rgba(255,255,255,.32)",
                }}>
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "rgba(255,255,255,.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="leading-[1.1]">
                  <b className="block text-[15px] font-bold">Start a new case</b>
                  <span className="text-[10.5px] font-medium opacity-90">Photos, location, evidence</span>
                </span>
              </Link>

              {/* btn-mic */}
              <Link href="/file" aria-label="Voice input"
                className="relative flex w-[54px] flex-none items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(160deg,color-mix(in srgb,var(--g-gold-lt) 55%,#fff),color-mix(in srgb,var(--g-gold-lt) 82%,var(--g-bg)))",
                  border: "1px solid color-mix(in srgb,var(--g-gold) 45%,transparent)",
                  boxShadow: "0 10px 22px -12px color-mix(in srgb,var(--g-gold) 70%,transparent),inset 0 1px 0 rgba(255,255,255,.7)",
                  color: "var(--g-primary-deep)",
                }}>
                <span className="pointer-events-none absolute inset-0 rounded-2xl" aria-hidden
                  style={{ border: "1.5px solid color-mix(in srgb,var(--g-primary) 50%,transparent)", animation: "micpulse 2.6s ease-out infinite" }} />
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2.5" width="6" height="12" rx="3" fill="currentColor" />
                  <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
              </Link>
            </div>

            {/* category chips */}
            <div className="relative z-[1] -mb-1 mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {CHIPS.map(({ label, icon }) => (
                <Link key={label} href={`/file?category=${label.toUpperCase()}`}
                  className="flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold"
                  style={{ background: "var(--g-paper)", borderColor: "var(--g-line)", color: "var(--g-chip-ink)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    style={{ color: "var(--g-primary)" }}
                    dangerouslySetInnerHTML={{ __html: icon }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent cases ── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-[18px] font-normal" style={{ color: "var(--g-ink)" }}>
              <svg className="mr-2 inline-block align-[-2px]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 12.4h11M4.6 12.4a3.4 3.4 0 0 1 6.8 0" fill="color-mix(in srgb,var(--g-gold) 45%,transparent)" stroke="var(--g-gold)" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M8 3.3v1.5M3.6 5.3l1 1M12.4 5.3l-1 1" stroke="var(--g-gold)" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Your recent cases
            </h3>
            <Link href="/cases" className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "var(--g-primary)" }}>
              All {caseCount}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-[18px] p-8 text-center text-[13px]"
              style={{ background: "var(--g-card)", border: "1px solid var(--g-line)", color: "var(--g-ink-soft)" }}>
              No complaints filed yet. Your civic journey starts here.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recent.map((c) => {
                const pct = slaPercent(c.status);
                const isWarn = c.status === "IN_PROGRESS" || c.status === "FILED" || c.status === "PENDING";
                return (
                  <Link key={c.id} href={`/cases/${c.id}`}
                    className="relative flex items-center gap-3 overflow-hidden rounded-[18px] p-3 transition-shadow hover:shadow-md"
                    style={{ background: "var(--g-card)", border: "1px solid var(--g-line)", boxShadow: "0 10px 22px -18px rgba(20,12,6,.45)" }}>
                    <CategoryThumb category={c.categoryId ?? "PUBLIC_WORKS"} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: "var(--g-ink-faint)" }}>{c.number}</p>
                      <p className="mt-0.5 mb-1.5 truncate text-[13.5px] font-semibold" style={{ color: "var(--g-ink)" }}>{c.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            background: isWarn ? "color-mix(in srgb,var(--g-warn) 18%,var(--g-card))" : "color-mix(in srgb,var(--g-ok) 16%,var(--g-card))",
                            color: isWarn ? "color-mix(in srgb,var(--g-warn) 75%,var(--g-ink))" : "color-mix(in srgb,var(--g-ok) 78%,var(--g-ink))",
                          }}>
                          <span className="h-[5px] w-[5px] rounded-full" style={{ background: isWarn ? "var(--g-warn)" : "var(--g-ok)" }} />
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      </div>
                    </div>
                    <SlaRing percent={pct} status={c.status} />
                    {/* lotus watermark */}
                    <div className="pointer-events-none absolute -right-3 -bottom-4 z-0 opacity-[0.09]" aria-hidden>
                      <svg width="82" height="82" viewBox="0 0 82 82">
                        {Array.from({ length: 8 }, (_, i) => (
                          <path key={i}
                            d={`M41 41 q ${37.7 * 0.2} -${37.7 * 0.55} 0 -${37.7} q -${37.7 * 0.2} ${37.7 * 0.55} 0 ${37.7}Z`}
                            transform={`rotate(${i * 45} 41 41)`}
                            fill="none" stroke="var(--g-accent)" strokeWidth="1.2" />
                        ))}
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Hot in your ward ── */}
        {hot.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-[18px] font-normal" style={{ color: "var(--g-ink)" }}>
                Hot in your ward
              </h3>
              <Link href="/feed" className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "var(--g-primary)" }}>
                Map
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:-mx-6 md:px-6">
              {hot.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`}
                  className={cn("flex w-[208px] flex-none flex-col overflow-hidden rounded-[20px]")}
                  style={{ background: "var(--g-card)", border: "1px solid var(--g-line)", boxShadow: "0 14px 30px -22px rgba(20,12,6,.5)" }}>
                  <div className="relative flex h-[104px] items-end px-3 pb-3 overflow-hidden"
                    style={{ background: "linear-gradient(to bottom,color-mix(in srgb,var(--g-gold-lt) 50%,var(--g-paper)),var(--g-paper))" }}>
                    <div className="absolute right-6 top-4 h-10 w-10 rounded-full opacity-70"
                      style={{ background: "radial-gradient(circle,var(--g-glow) 30%,transparent 80%)" }} />
                    <span className="relative z-[3] flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[.5px]"
                      style={{ background: "rgba(20,12,6,.42)", backdropFilter: "blur(6px)", color: "#FFF0DC" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2c1 3-1 4 0 7 .6 1.8 3 2 3 5a6 6 0 0 1-12 0c0-2 1-3 2-2 .5-3 4-4 5-10Z" fill="#FF9A4D" />
                      </svg>
                      Trending
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 px-3 py-3">
                    <p className="text-[13.5px] font-semibold leading-[1.25]" style={{ color: "var(--g-ink)" }}>
                      {c.title.length > 52 ? c.title.slice(0, 52) + "…" : c.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold" style={{ color: "var(--g-primary)" }}>
                        +{c._count.cosigns}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold"
                        style={{ color: "var(--g-primary)", borderColor: "color-mix(in srgb,var(--g-primary) 25%,var(--g-line))", background: "color-mix(in srgb,var(--g-primary) 10%,var(--g-card))" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5l7 8h-4v6H9v-6H5l7-8Z" fill="currentColor" />
                        </svg>
                        Upvote
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
