import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { initials } from "@/lib/utils";
import { tierForScore } from "@/lib/reputation";
import { REPUTATION_TIERS } from "@/types";
import { TierEmblem } from "@/components/art/tier-emblem";
import { BadgeGrid } from "@/components/citizen/badge-grid";
import { SettingsForm } from "@/components/citizen/settings-form";
import { ThemePicker } from "@/components/citizen/theme-gallery";
import { LogoutButton } from "@/components/shared/logout-button";
import { getT } from "@/lib/t";

export default async function ProfilePage() {
  const session = await requireRole(["CITIZEN"]);
  const user = await db.user.findUnique({
    where: { id: session.id },
    include: {
      badges: true,
      _count: { select: { cases: true, upvotes: true, cosigns: true } },
    },
  });
  if (!user) return null;

  const earned = user.badges.map((b) => b.badgeId);
  const tier = tierForScore(user.reputation);
  const t = getT(user.language ?? "en");

  // Tier progress for the reputation bar.
  const tierIdx = REPUTATION_TIERS.findIndex(
    (x) => user.reputation >= x.min && user.reputation <= x.max,
  );
  const curTier = REPUTATION_TIERS[tierIdx] ?? REPUTATION_TIERS[0];
  const nextTier = REPUTATION_TIERS[tierIdx + 1];
  const span = curTier.max - curTier.min || 1;
  const progress = nextTier
    ? Math.min(100, Math.round(((user.reputation - curTier.min) / span) * 100))
    : 100;
  const toNext = nextTier ? nextTier.min - user.reputation : 0;

  return (
    <div className="mk space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{user.name}</h1>
        <p className="text-muted-foreground text-sm">
          Ward {user.wardCode ?? "—"}
        </p>
      </div>

      {/* Reputation header (mockup) — tier, points, streak, progress. */}
      <div className="card">
        <div className="cb">
          <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
            <div
              className="av"
              style={{ width: 50, height: 50, fontSize: 16, borderRadius: "var(--u-r)", flex: "0 0 auto" }}
            >
              {initials(user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t1" style={{ fontSize: "15px" }}>
                {tier}
              </div>
              <div className="t2" style={{ marginTop: 3 }}>
                Tier {tierIdx + 1} ·{" "}
                <b style={{ color: "var(--u-ink)" }}>
                  {user.reputation.toLocaleString()}
                </b>{" "}
                points
              </div>
            </div>
            <div style={{ textAlign: "center", flex: "0 0 auto" }}>
              <TierEmblem tier={tier} className="mx-auto w-12" />
              <div className="t2" style={{ fontSize: "9.5px", marginTop: 4, whiteSpace: "nowrap" }}>
                <b style={{ color: "var(--u-ink)", fontSize: "12px" }}>
                  {user.streakDays}
                </b>{" "}
                day streak
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="trk" style={{ height: 6 }}>
              <i style={{ width: `${progress}%`, background: "var(--u-gold)" }} />
            </div>
            <div className="tcap">
              <span>
                <b>{tier}</b>
              </span>
              <span>
                {nextTier ? `${toNext} pts to ${nextTier.name}` : "Top tier"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Earned on outcomes — reputation accrues on confirmed outcomes only. */}
      <div className="card">
        <div className="ch">
          <b>Your activity</b>
          <span className="m">POINTS ON OUTCOMES</span>
        </div>
        <div className="cb">
          <div className="grid3" style={{ gap: 9 }}>
            <div>
              <div className="k">{t("profile.complaints")}</div>
              <div className="v" style={{ fontSize: "21px" }}>{user._count.cases}</div>
            </div>
            <div>
              <div className="k">{t("profile.upvotesGiven")}</div>
              <div className="v" style={{ fontSize: "21px" }}>{user._count.upvotes}</div>
            </div>
            <div>
              <div className="k">{t("profile.cosigns")}</div>
              <div className="v" style={{ fontSize: "21px" }}>{user._count.cosigns}</div>
            </div>
          </div>
          <div className="aihint" style={{ marginTop: 11 }}>
            Points accrue when a case you filed or co-signed is{" "}
            <b>confirmed resolved by a citizen</b> — never for filing alone.
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            {t("profile.badges")}
          </h2>
          <BadgeGrid earned={earned} />
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            {t("profile.settings")}
          </h2>
          <SettingsForm
            initial={{
              language: user.language,
              aiAssistLevel: user.aiAssistLevel,
              showOnLeaderboard: user.showOnLeaderboard,
            }}
          />
        </section>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {t("profile.appearance")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("profile.appearanceSub")}
          </p>
        </div>
        <ThemePicker />
      </section>

      <section className="border-border flex items-center justify-between border-t pt-6">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {t("common.signOut")}
          </h2>
          <p className="text-muted-foreground text-sm">{user.name}</p>
        </div>
        <LogoutButton />
      </section>
    </div>
  );
}
