import { describe, it, expect } from "vitest";
import { computeSlaDueAt, slaState, isBreached } from "@/lib/sla";
import { addDays } from "date-fns";

describe("computeSlaDueAt", () => {
  it("adds the category SLA days to createdAt", () => {
    const created = new Date("2026-06-01T00:00:00Z");
    // cat_san_garbage SLA = 3 days
    expect(computeSlaDueAt(created, "cat_san_garbage").getTime()).toBe(
      addDays(created, 3).getTime(),
    );
  });

  it("falls back to 7 days for unknown categories", () => {
    const created = new Date("2026-06-01T00:00:00Z");
    expect(computeSlaDueAt(created, "nope").getTime()).toBe(
      addDays(created, 7).getTime(),
    );
  });
});

describe("slaState", () => {
  const created = new Date("2026-06-01T00:00:00Z");
  const due = new Date("2026-06-11T00:00:00Z"); // 10-day window

  it("is safe with > 50% time left", () => {
    expect(slaState(created, due, new Date("2026-06-02T00:00:00Z"))).toBe("safe");
  });

  it("is warning between 10% and 50% left", () => {
    expect(slaState(created, due, new Date("2026-06-07T00:00:00Z"))).toBe(
      "warning",
    );
  });

  it("is breach under 10% left", () => {
    expect(slaState(created, due, new Date("2026-06-10T18:00:00Z"))).toBe(
      "breach",
    );
  });

  it("is breach past due", () => {
    expect(slaState(created, due, new Date("2026-06-12T00:00:00Z"))).toBe(
      "breach",
    );
  });
});

describe("isBreached", () => {
  it("detects overdue", () => {
    const due = new Date("2026-06-01T00:00:00Z");
    expect(isBreached(due, new Date("2026-06-02T00:00:00Z"))).toBe(true);
    expect(isBreached(due, new Date("2026-05-30T00:00:00Z"))).toBe(false);
  });
});
