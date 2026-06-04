import { describe, it, expect } from "vitest";
import {
  drafter,
  classifier,
  qualityScorer,
  officerBrief,
  trendDigest,
  categoryListText,
} from "@/lib/ai/prompts";

describe("categoryListText", () => {
  it("lists every department code and category ids", () => {
    const text = categoryListText();
    expect(text).toContain("SANITATION");
    expect(text).toContain("PUBLIC_WORKS");
    expect(text).toContain("cat_san_garbage");
  });
});

describe("prompt builders", () => {
  it("drafter embeds the original text and asks for JSON", () => {
    const u = drafter.user("garbage everywhere");
    expect(u).toContain("garbage everywhere");
    expect(u).toContain('"title"');
    expect(drafter.version).toBe("draft.v1");
  });

  it("classifier embeds title/body/ward and severity rule", () => {
    const u = classifier.user("Pothole", "big hole", "KE");
    expect(u).toContain("Pothole");
    expect(u).toContain("big hole");
    expect(u).toContain("KE");
    expect(u).toContain("HIGH");
    expect(classifier.version).toBe("classify.v1");
  });

  it("quality scorer flags boilerplate and uses a 0-10 scale", () => {
    const u = qualityScorer.user("issue resolved", "none");
    expect(u).toContain("issue resolved");
    expect(qualityScorer.system.toLowerCase()).toContain("boilerplate");
    expect(qualityScorer.version).toBe("quality.v1");
  });

  it("officer brief includes the 3-line structure inputs", () => {
    const u = officerBrief.user({
      number: "SMD-1",
      title: "T",
      body: "B",
      wardCode: "A",
      department: "Sanitation",
      category: "Garbage",
      severity: "HIGH",
      createdAt: "2026-06-01",
      cosignCount: 2,
      events: "- CREATED",
    });
    expect(u).toContain("SMD-1");
    expect(u).toContain("Co-signers: 2");
    expect(officerBrief.version).toBe("summarise.v1");
  });

  it("trend digest embeds period and asks for interventions", () => {
    const u = trendDigest.user({
      periodDays: 30,
      categories: "- Garbage: 5",
      wardBreaches: "- A: 50%",
      clusters: "- Garbage (5 cases)",
    });
    expect(u).toContain("30 days");
    expect(u).toContain("interventions");
    expect(trendDigest.version).toBe("digest.v1");
  });
});
