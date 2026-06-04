import { db } from "@/lib/db";
import { computeReputation } from "@/lib/reputation";
import { BADGES } from "@/lib/seed-data";

/** Award a badge if not already held. Returns true if newly awarded. */
export async function awardBadge(
  userId: string,
  badgeId: string,
): Promise<boolean> {
  const existing = await db.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } },
  });
  if (existing) return false;

  await db.userBadge.create({ data: { userId, badgeId } });

  const badge = BADGES.find((b) => b.id === badgeId);
  await db.notification.create({
    data: {
      userId,
      title: `Badge unlocked: ${badge?.name ?? badgeId}`,
      body: badge?.description ?? "You earned a new badge.",
      link: "/profile",
    },
  });
  return true;
}

/** Recompute and persist a user's civic reputation from current DB state (§5.3.1). */
export async function recomputeReputation(userId: string): Promise<number> {
  const [verifiedResolved, upvotesGiven, cosignsMade, badgeCount, user] =
    await Promise.all([
      db.case.count({
        where: { filedById: userId, status: { in: ["RESOLVED", "CLOSED"] } },
      }),
      db.upvote.count({ where: { userId } }),
      db.cosign.count({ where: { userId } }),
      db.userBadge.count({ where: { userId } }),
      db.user.findUnique({ where: { id: userId }, select: { streakDays: true } }),
    ]);

  const score = computeReputation({
    verifiedResolvedComplaints: verifiedResolved,
    helpfulUpvotesGiven: upvotesGiven,
    coSignsMade: cosignsMade,
    frivolousComplaints: 0,
    duplicatesFiled: 0,
    currentStreak: user?.streakDays ?? 0,
    badgeCount,
  });

  await db.user.update({ where: { id: userId }, data: { reputation: score } });
  return score;
}
