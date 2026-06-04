import { Flame, FileText, ThumbsUp, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { initials } from "@/lib/utils";
import { TierChip } from "@/components/case/reputation-tier";
import { BadgeGrid } from "@/components/citizen/badge-grid";
import { SettingsForm } from "@/components/citizen/settings-form";
import { Card, CardContent } from "@/components/ui/card";

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
  const stats = [
    { label: "Complaints", value: user._count.cases, icon: FileText },
    { label: "Upvotes given", value: user._count.upvotes, icon: ThumbsUp },
    { label: "Co-signs", value: user._count.cosigns, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* identity */}
      <div className="flex items-center gap-4">
        <span
          className="bg-brand-soft text-brand flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold"
          aria-hidden
        >
          {initials(user.name)}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">{user.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <TierChip reputation={user.reputation} />
            <span className="text-warning inline-flex items-center gap-1 text-sm">
              <Flame className="h-4 w-4" />
              <span className="font-baloo font-semibold">
                {user.streakDays}
              </span>
              -day streak
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label}>
                  <CardContent className="p-4">
                    <Icon className="text-muted-foreground h-4 w-4" />
                    <p className="font-baloo mt-1 text-2xl font-semibold">
                      {s.value}
                    </p>
                    <p className="text-muted-foreground text-xs">{s.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Badges</h2>
            <BadgeGrid earned={earned} />
          </section>
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Settings</h2>
          <SettingsForm
            initial={{
              language: user.language,
              aiAssistLevel: user.aiAssistLevel,
              showOnLeaderboard: user.showOnLeaderboard,
            }}
          />
        </section>
      </div>
    </div>
  );
}
