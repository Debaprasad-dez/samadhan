import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { tierForScore } from "@/lib/reputation";
import { ThemedHero } from "@/components/art/themed-hero";
import { marigold, leaf } from "@/lib/art/core";
import { RevealList } from "@/components/motion/reveal";
import { CardArtwork } from "@/components/art/card-artwork";
import { VoiceMicButton } from "@/components/citizen/voice-capture";
import { WardSelector } from "@/components/citizen/ward-selector";
import { CategoryChips } from "@/components/citizen/category-chips";
import { SlaBar } from "@/components/primitives/sla-bar";
import { StatusBadge } from "@/components/case/status-badge";
import { CATEGORIES } from "@/lib/seed-data";
import { getT } from "@/lib/t";
import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/types";

// Floating marigold-and-leaf sprig (design handoff decorate()) — perches over the
// CTA card's top-right corner; the .bloom class gives it a gentle sway.
const SPRIG = `${leaf(64, 22)}${leaf(22, 40)}${marigold(36, 30, 12, false)}${marigold(62, 40, 9, false)}${marigold(50, 22, 7, true)}`;


export default async function CitizenHome() {
  const user = await requireRole(["CITIZEN"]);

  const [caseCount, recent, hot] = await Promise.all([
    db.case.count({ where: { filedById: user.id } }),
    db.case.findMany({
      // Active cases, sorted BY TIME LEFT (invariant 4) for the home list.
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
      where: { filedById: { not: user.id } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, categoryId: true, status: true, _count: { select: { cosigns: true } } },
    }),
  ]);

  const tier = tierForScore(user.reputation);
  const firstName = user.name.split(" ")[0];
  const t = getT(user.language ?? "en");

  return (
    <div className="flex flex-col">

      {/* ── Hero: full-bleed, break out of shell padding. Each theme renders its
          own procedural scene (SceneHero follows data-theme), so the overlay uses
          --g-ink etc. and reads correctly on both light and dark traditions. ── */}
      <div className="relative -mx-4 md:-mx-6">
        <ThemedHero />

        <div className="absolute inset-x-6 top-6 z-[8]">
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
              <p className="font-display text-lg leading-none" style={{ color: "var(--g-ink)" }}>समाधान</p>
              <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[2.5px]" style={{ color: "var(--g-ink-soft)" }}>Samadhan</p>
            </div>
            <WardSelector initialWard={user.wardCode ?? undefined} />
          </div>

          {/* greeting with frosted veil */}
          <div className="relative mt-5">
            <div className="pointer-events-none absolute -inset-3 z-[-1]"
              style={{
                background: "radial-gradient(120% 120% at 22% 44%,color-mix(in srgb,var(--g-bg) 90%,transparent) 0%,color-mix(in srgb,var(--g-bg) 66%,transparent) 56%,transparent 84%)",
                backdropFilter: "blur(2.5px)",
                WebkitMaskImage: "radial-gradient(120% 120% at 26% 44%,#000 40%,transparent 82%)",
                maskImage: "radial-gradient(120% 120% at 26% 44%,#000 40%,transparent 82%)",
              }} />
            <p className="font-display text-[13px] italic" style={{ color: "var(--g-primary-deep)" }}>
              {t("time.morning")} — {t("time.wakes")}
            </p>
            <h1 className="font-display text-[33px] leading-[1.06] tracking-[-0.2px]" style={{ color: "var(--g-ink)" }}>
              {t("time.morning")},<br />
              <span style={{ color: "var(--g-primary-deep)" }}>{firstName}</span>
            </h1>
            <p className="mt-2 max-w-[225px] text-[12.5px] font-medium" style={{ color: "var(--g-ink-soft)" }}>
              {t("home.journey")}{" "}
              <span className="font-semibold" style={{ color: "var(--g-primary)" }}>{tier} · {user.reputation} pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Body: overlaps hero by ~46px. All colours from --g-* → reskins per theme.
          RevealList staggers the cascade on load (§6.3). ── */}
      <RevealList className="relative z-[9] -mx-4 -mt-20 flex flex-col gap-6 px-4 pb-4 md:-mx-6 md:px-6">

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
              boxShadow: "0 1px 0 rgba(255,255,255,.06) inset,0 14px 34px -22px rgba(6,8,20,.6),0 4px 12px -8px rgba(6,8,20,.34)",
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

            <p className="relative z-[1] text-[10.5px] font-bold uppercase tracking-[2px]" style={{ color: "var(--g-primary)" }}>{t("home.raiseVoice")}</p>
            <h2 className="relative z-[1] font-display text-[23px] leading-[1.1]" style={{ color: "var(--g-ink)", marginTop: 6, marginBottom: 2 }}>{t("home.fileComplaint")}</h2>
            <p className="relative z-[1] mb-4 max-w-[200px] text-[12px] leading-[1.4]" style={{ color: "var(--g-ink-soft)" }}>
              {t("home.fileSub")}
            </p>

            <div className="relative z-[1] flex items-stretch gap-3">
              {/* btn-file */}
              <Link href="/file"
                className="relative flex flex-1 items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 transition-transform active:translate-y-0.5 active:scale-[.99]"
                style={{
                  background: "var(--g-btn-grad)",
                  color: "var(--g-btn-ink)",
                  boxShadow: "0 8px 18px -12px rgba(6,8,20,.55),inset 0 1px 0 rgba(255,255,255,.22)",
                }}>
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "rgba(255,255,255,.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="leading-[1.1]">
                  <b className="block text-[15px] font-bold">{t("home.startCase")}</b>
                  <span className="text-[10.5px] font-medium opacity-90">{t("home.startCaseSub")}</span>
                </span>
              </Link>

              {/* btn-mic → opens the voice-capture dialog */}
              <VoiceMicButton ariaLabel={t("home.voiceInput")} />
            </div>

            {/* category chips → drop a #tag into the draft description */}
            <CategoryChips />
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
              {t("home.recentCases")}
            </h3>
            <Link href="/cases" className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "var(--g-primary)" }}>
              {t("common.all")} {caseCount}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-[18px] p-8 text-center text-[13px]"
              style={{ background: "var(--g-card)", border: "1px solid var(--g-line)", color: "var(--g-ink-soft)" }}>
              {t("home.noCases")}
            </div>
          ) : (
            // Mockup "Your active cases" card — rows with the SLA bar + status pill,
            // sorted by time left.
            <div className="mk">
              <div className="card">
                <div className="ch">
                  <b>{t("home.recentCases")}</b>
                  <span className="m">BY TIME LEFT</span>
                </div>
                {recent.map((c) => {
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
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── Hot in your ward ── */}
        {hot.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-[18px] font-normal" style={{ color: "var(--g-ink)" }}>
                {t("home.hotInWard")}
              </h3>
              <Link href="/feed" className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "var(--g-primary)" }}>
                {t("common.map")}
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
                  <div className="relative h-[104px]">
                    <CardArtwork
                      category={c.categoryId ?? undefined}
                      seed={c.id}
                      className="absolute inset-0"
                    />
                    <span className="absolute left-3 top-3 z-[3] flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[.5px]"
                      style={{ background: "rgba(20,12,6,.42)", backdropFilter: "blur(6px)", color: "#FFF0DC" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2c1 3-1 4 0 7 .6 1.8 3 2 3 5a6 6 0 0 1-12 0c0-2 1-3 2-2 .5-3 4-4 5-10Z" fill="#FF9A4D" />
                      </svg>
                      {t("home.trending")}
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
                        {t("common.upvote")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </RevealList>
    </div>
  );
}
