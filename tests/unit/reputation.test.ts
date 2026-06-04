import { describe, it, expect } from "vitest";
import {
  computeReputation,
  streakBonus,
  tierForScore,
} from "@/lib/reputation";

const base = {
  verifiedResolvedComplaints: 0,
  helpfulUpvotesGiven: 0,
  coSignsMade: 0,
  frivolousComplaints: 0,
  duplicatesFiled: 0,
  currentStreak: 0,
  badgeCount: 0,
};

describe("computeReputation", () => {
  it("starts at the 100 baseline", () => {
    expect(computeReputation(base)).toBe(100);
  });

  it("adds 10 per verified resolved complaint", () => {
    expect(computeReputation({ ...base, verifiedResolvedComplaints: 3 })).toBe(130);
  });

  it("caps helpful upvotes at 50", () => {
    expect(computeReputation({ ...base, helpfulUpvotesGiven: 80 })).toBe(150);
  });

  it("caps co-sign bonus at 40", () => {
    expect(computeReputation({ ...base, coSignsMade: 50 })).toBe(140);
  });

  it("applies penalties and floors at 0", () => {
    expect(
      computeReputation({ ...base, frivolousComplaints: 100 }),
    ).toBe(0);
  });

  it("adds badge bonuses (5 each) and streak bonus", () => {
    // 100 + 5 badges*? no: badgeCount 2 → +10, streak 7 → +10
    expect(computeReputation({ ...base, badgeCount: 2, currentStreak: 7 })).toBe(
      120,
    );
  });
});

describe("streakBonus", () => {
  it("scales by milestones", () => {
    expect(streakBonus(0)).toBe(0);
    expect(streakBonus(3)).toBe(3);
    expect(streakBonus(7)).toBe(10);
    expect(streakBonus(14)).toBe(25);
    expect(streakBonus(30)).toBe(50);
  });
});

describe("tierForScore", () => {
  it("maps scores to tiers (§5.3.1)", () => {
    expect(tierForScore(0)).toBe("Watcher");
    expect(tierForScore(199)).toBe("Watcher");
    expect(tierForScore(200)).toBe("Reporter");
    expect(tierForScore(500)).toBe("Advocate");
    expect(tierForScore(1000)).toBe("Champion");
    expect(tierForScore(5000)).toBe("Civic Patron");
  });
});
