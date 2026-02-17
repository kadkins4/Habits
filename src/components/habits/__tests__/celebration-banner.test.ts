import { describe, it, expect } from "vitest";
import { detectCelebrations } from "@/components/habits/utils";
import type { StatsSnapshot } from "@/lib/types";

function makeSnapshot(overrides: Partial<StatsSnapshot> = {}): StatsSnapshot {
  return { dailyPct: 0, weeklyPct: 0, monthlyPct: 0, streak: 0, ...overrides };
}

function makeCurrent(overrides: Partial<StatsSnapshot & { dailyEarned: number }> = {}) {
  return { dailyPct: 0, weeklyPct: 0, monthlyPct: 0, streak: 0, dailyEarned: 0, ...overrides };
}

describe("detectCelebrations", () => {
  it("returns empty array when no thresholds crossed", () => {
    const prev = makeSnapshot({ dailyPct: 50 });
    const current = makeCurrent({ dailyPct: 60 });
    expect(detectCelebrations(prev, current)).toEqual([]);
  });

  it("fires daily celebration when going from <100% to 100%", () => {
    const prev = makeSnapshot({ dailyPct: 80 });
    const current = makeCurrent({ dailyPct: 100, dailyEarned: 50 });
    const result = detectCelebrations(prev, current);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("daily");
    expect(result[0].message).toContain("50 XP");
  });

  it("fires weekly celebration when going from <100% to 100%", () => {
    const prev = makeSnapshot({ weeklyPct: 90 });
    const current = makeCurrent({ weeklyPct: 100 });
    const result = detectCelebrations(prev, current);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("weekly");
  });

  it("fires monthly celebration when going from <100% to 100%", () => {
    const prev = makeSnapshot({ monthlyPct: 95 });
    const current = makeCurrent({ monthlyPct: 100 });
    const result = detectCelebrations(prev, current);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("monthly");
  });

  it("fires streak milestone celebrations at 7, 14, 30", () => {
    const prev7 = makeSnapshot({ streak: 6 });
    const current7 = makeCurrent({ streak: 7 });
    expect(detectCelebrations(prev7, current7)).toEqual([
      expect.objectContaining({ id: "streak-7" }),
    ]);

    const prev14 = makeSnapshot({ streak: 13 });
    const current14 = makeCurrent({ streak: 14 });
    expect(detectCelebrations(prev14, current14)).toEqual([
      expect.objectContaining({ id: "streak-14" }),
    ]);

    const prev30 = makeSnapshot({ streak: 29 });
    const current30 = makeCurrent({ streak: 30 });
    expect(detectCelebrations(prev30, current30)).toEqual([
      expect.objectContaining({ id: "streak-30" }),
    ]);
  });

  it("can fire multiple celebrations at once", () => {
    const prev = makeSnapshot({ dailyPct: 80, weeklyPct: 90, streak: 6 });
    const current = makeCurrent({ dailyPct: 100, weeklyPct: 100, streak: 7, dailyEarned: 30 });
    const result = detectCelebrations(prev, current);
    expect(result).toHaveLength(3);
    const ids = result.map((c) => c.id);
    expect(ids).toContain("daily");
    expect(ids).toContain("weekly");
    expect(ids).toContain("streak-7");
  });

  it("does not re-fire if already at 100%", () => {
    const prev = makeSnapshot({ dailyPct: 100 });
    const current = makeCurrent({ dailyPct: 100, dailyEarned: 50 });
    expect(detectCelebrations(prev, current)).toEqual([]);
  });
});
