import { differenceInCalendarDays } from "date-fns";
import { db } from "@/lib/db";
import { awardBadge, recomputeReputation } from "@/lib/badges";

/**
 * Streak ping (§5.3.3): debounced once per calendar day per user.
 * Consecutive day → +1; gap → reset to 1. Awards Streak Starter (7) / Keeper (30).
 */
export async function touchStreak(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { lastVisitAt: true, streakDays: true },
  });
  if (!user) return;

  const now = new Date();
  let streak = 1;
  if (user.lastVisitAt) {
    const diff = differenceInCalendarDays(now, user.lastVisitAt);
    if (diff === 0) return; // already counted today
    streak = diff === 1 ? user.streakDays + 1 : 1;
  }

  await db.user.update({
    where: { id: userId },
    data: { streakDays: streak, lastVisitAt: now },
  });

  if (streak >= 7) await awardBadge(userId, "streak-starter");
  if (streak >= 30) await awardBadge(userId, "streak-keeper");
  await recomputeReputation(userId);
}
