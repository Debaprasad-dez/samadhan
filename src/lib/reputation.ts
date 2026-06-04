import { REPUTATION_TIERS, type ReputationTier } from "@/types";

export interface ReputationInputs {
  verifiedResolvedComplaints: number;
  helpfulUpvotesGiven: number;
  coSignsMade: number;
  frivolousComplaints: number;
  duplicatesFiled: number;
  currentStreak: number;
  badgeCount: number;
}

/** Streak bonus table (§5.3.1). */
export function streakBonus(streak: number): number {
  if (streak >= 30) return 50;
  if (streak >= 14) return 25;
  if (streak >= 7) return 10;
  if (streak >= 3) return 3;
  return 0;
}

/**
 * Deterministic civic reputation score (§5.3.1).
 *
 *   score = 100
 *     + verified_resolved_complaints * 10
 *     + helpful_upvotes_given * 1   (max 50)
 *     + co_signs_made * 2           (max 40)
 *     - frivolous_complaints * 15
 *     - duplicates_filed * 3
 *     + streak_bonus
 *     + badge_bonuses (5 each)
 *
 * Floored at 0; no upper cap (a tier is shown instead of the raw number).
 */
export function computeReputation(i: ReputationInputs): number {
  const score =
    100 +
    i.verifiedResolvedComplaints * 10 +
    Math.min(i.helpfulUpvotesGiven, 50) * 1 +
    Math.min(i.coSignsMade * 2, 40) -
    i.frivolousComplaints * 15 -
    i.duplicatesFiled * 3 +
    streakBonus(i.currentStreak) +
    i.badgeCount * 5;

  return Math.max(0, Math.round(score));
}

export function tierForScore(score: number): ReputationTier {
  const tier = REPUTATION_TIERS.find((t) => score >= t.min && score <= t.max);
  return tier?.name ?? "Watcher";
}
