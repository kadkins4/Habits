import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const mockAll = vi.fn();
  const mockWhere = vi.fn(() => ({ all: mockAll }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  return { mockAll, mockWhere, mockFrom, mockSelect };
});
const { mockAll } = mocks;

vi.mock("@/db", () => ({
  db: {
    select: mocks.mockSelect,
  },
}));

vi.mock("@/db/schema", () => ({
  habits: {
    status: "status",
    created_at: "created_at",
  },
  completions: {
    date: "date",
    habit_id: "habit_id",
  },
}));

import {
  calculateDailyScore,
  calculateStreak,
  formatDate,
  getMonday,
  getDaysInRange,
} from "@/lib/scoring";

describe("formatDate", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatDate(new Date(2026, 11, 25))).toBe("2026-12-25");
  });
});

describe("getMonday", () => {
  it("returns the Monday of the given date's week", () => {
    const wed = new Date(2026, 1, 11);
    const monday = getMonday(wed);
    expect(formatDate(monday)).toBe("2026-02-09");
  });

  it("returns the same date when given a Monday", () => {
    const mon = new Date(2026, 1, 9);
    expect(formatDate(getMonday(mon))).toBe("2026-02-09");
  });

  it("returns the previous Monday for a Sunday", () => {
    const sun = new Date(2026, 1, 15);
    expect(formatDate(getMonday(sun))).toBe("2026-02-09");
  });
});

describe("getDaysInRange", () => {
  it("returns all days in range", () => {
    const start = new Date(2026, 1, 9);
    const end = new Date(2026, 1, 15);
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(7);
    expect(days[0]).toBe("2026-02-09");
    expect(days[6]).toBe("2026-02-15");
  });
});

describe("calculateDailyScore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zeros when no active habits", () => {
    mockAll.mockReturnValueOnce([]);
    const score = calculateDailyScore("2026-02-15");
    expect(score).toEqual({ earned: 0, possible: 0, percentage: 0 });
  });

  it("calculates correct XP from completed habits", () => {
    const habitsData = [
      { id: "h1", name: "Exercise", difficulty: "hard", status: "active", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" },
      { id: "h2", name: "Read", difficulty: "medium", status: "active", sort_order: 2, created_at: "2026-01-01T00:00:00.000Z" },
    ];
    const completionsData = [{ id: "c1", habit_id: "h1", date: "2026-02-15" }];

    mockAll.mockReturnValueOnce(habitsData).mockReturnValueOnce(completionsData);

    const score = calculateDailyScore("2026-02-15");
    // hard=20, medium=10; earned=20 (h1 completed), possible=30
    expect(score).toEqual({ earned: 20, possible: 30, percentage: 67 });
  });

  it("ignores habits created after the given date", () => {
    const habitsData = [
      { id: "h1", name: "Exercise", difficulty: "hard", status: "active", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" },
    ];
    const completionsData = [{ id: "c1", habit_id: "h1", date: "2026-02-10" }];

    mockAll.mockReturnValueOnce(habitsData).mockReturnValueOnce(completionsData);

    const score = calculateDailyScore("2026-02-10");
    expect(score).toEqual({ earned: 20, possible: 20, percentage: 100 });
  });

  it("handles partial completion percentage", () => {
    const habitsData = [
      { id: "h1", name: "Exercise", difficulty: "medium", status: "active", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" },
      { id: "h2", name: "Read", difficulty: "medium", status: "active", sort_order: 2, created_at: "2026-01-01T00:00:00.000Z" },
      { id: "h3", name: "Meditate", difficulty: "medium", status: "active", sort_order: 3, created_at: "2026-01-01T00:00:00.000Z" },
    ];
    const completionsData = [{ id: "c1", habit_id: "h1", date: "2026-02-15" }];

    mockAll.mockReturnValueOnce(habitsData).mockReturnValueOnce(completionsData);

    const score = calculateDailyScore("2026-02-15");
    // all medium=10; earned=10 (h1 completed), possible=30
    expect(score).toEqual({ earned: 10, possible: 30, percentage: 33 });
  });
});

describe("calculateStreak", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("counts consecutive 100% days", () => {
    vi.setSystemTime(new Date(2026, 1, 12));

    const habit = { id: "h1", name: "Exercise", difficulty: "medium", status: "active", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" };
    const completion = (date: string) => ({ id: `c-${date}`, habit_id: "h1", date });

    mockAll
      .mockReturnValueOnce([habit]).mockReturnValueOnce([completion("2026-02-12")])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([completion("2026-02-11")])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([]);

    const streak = calculateStreak();
    expect(streak).toBe(2);

    vi.useRealTimers();
  });

  it("today incomplete does not break streak", () => {
    vi.setSystemTime(new Date(2026, 1, 12));

    const habit = { id: "h1", name: "Exercise", difficulty: "medium", status: "active", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" };
    const completion = (date: string) => ({ id: `c-${date}`, habit_id: "h1", date });

    mockAll
      .mockReturnValueOnce([habit]).mockReturnValueOnce([])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([completion("2026-02-11")])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([completion("2026-02-10")])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([]);

    const streak = calculateStreak();
    expect(streak).toBe(2);

    vi.useRealTimers();
  });

  it("skips days with 0 active habits", () => {
    vi.setSystemTime(new Date(2026, 1, 12));

    const habit = { id: "h1", name: "Exercise", difficulty: "medium", status: "active", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" };
    const completion = (date: string) => ({ id: `c-${date}`, habit_id: "h1", date });

    mockAll
      .mockReturnValueOnce([habit]).mockReturnValueOnce([completion("2026-02-12")])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([completion("2026-02-10")])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([]);

    const streak = calculateStreak();
    expect(streak).toBe(2);

    vi.useRealTimers();
  });

  it("stops at first non-100% day", () => {
    vi.setSystemTime(new Date(2026, 1, 12));

    const habit = { id: "h1", name: "Exercise", difficulty: "medium", status: "active", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" };
    const completion = (date: string) => ({ id: `c-${date}`, habit_id: "h1", date });

    mockAll
      .mockReturnValueOnce([habit]).mockReturnValueOnce([completion("2026-02-12")])
      .mockReturnValueOnce([habit]).mockReturnValueOnce([]);

    const streak = calculateStreak();
    expect(streak).toBe(1);

    vi.useRealTimers();
  });
});
