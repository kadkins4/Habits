import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const mockAll = vi.fn();
  const mockValues = vi.fn(() => Promise.resolve());
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockOrderBy = vi.fn(() => mockAll());
  const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));
  const mockFrom = vi.fn(() => {
    const result = { where: mockWhere, orderBy: mockOrderBy, then: (resolve: (v: unknown) => void) => resolve(mockAll()) };
    return result;
  });
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  return { mockAll, mockValues, mockInsert, mockOrderBy, mockWhere, mockFrom, mockSelect };
});
const { mockAll, mockValues, mockInsert, mockWhere } = mocks;

vi.mock("@/db", () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
  },
}));

vi.mock("@/db/schema", () => ({
  habits: {
    active: "active",
    sort_order: "sort_order",
  },
}));

import { GET, POST } from "@/app/api/habits/route";

describe("GET /api/habits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active habits ordered by sort_order", async () => {
    const habitsData = [
      { id: "h1", name: "Exercise", xp: 20, active: 1, sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" },
      { id: "h2", name: "Read", xp: 10, active: 1, sort_order: 2, created_at: "2026-01-01T00:00:00.000Z" },
    ];
    mockAll.mockResolvedValueOnce(habitsData);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.habits).toEqual(habitsData);
    expect(mockWhere).toHaveBeenCalled();
  });
});

describe("POST /api/habits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a habit with auto-incremented sort_order and returns 201", async () => {
    mockAll.mockResolvedValueOnce([{ max: 3 }]);

    const request = new Request("http://localhost/api/habits", {
      method: "POST",
      body: JSON.stringify({ name: "Meditate", xp: 15 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.habit.name).toBe("Meditate");
    expect(data.habit.xp).toBe(15);
    expect(data.habit.sort_order).toBe(4);
    expect(data.habit.active).toBe(1);
    expect(data.habit.id).toBeDefined();
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalled();
  });
});
