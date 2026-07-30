import { describe, it, expect } from "vitest";
import { slaBarModel } from "@/components/primitives/sla-bar";

describe("slaBarModel", () => {
  it("fill reaches the 78% marker exactly at the limit", () => {
    const m = slaBarModel(10 * 24, 10); // elapsed == limit
    expect(m.fillPct).toBeCloseTo(78, 5);
    expect(m.state).toBe("danger"); // ratio 100% → danger
    expect(m.overrun).toBe(false);
    expect(m.remainingLabel).toBe("0h left");
  });

  it("state thresholds: <60% ok, 60–100% warn, >=100% danger", () => {
    expect(slaBarModel(5 * 24, 10).state).toBe("ok"); // 50%
    expect(slaBarModel(7 * 24, 10).state).toBe("warn"); // 70%
    expect(slaBarModel(9.9 * 24, 10).state).toBe("warn"); // 99%
    expect(slaBarModel(11 * 24, 10).state).toBe("danger"); // 110%
  });

  it("overrun clamps fill to 100% and reports time over", () => {
    const m = slaBarModel(13 * 24, 10); // 130% → past the marker
    expect(m.fillPct).toBe(100);
    expect(m.overrun).toBe(true);
    expect(m.remainingLabel).toBe("3d over");
  });

  it("caption formats days + hours", () => {
    expect(slaBarModel(2 * 24 + 5, 10).elapsedLabel).toBe("2d 5h");
  });
});
