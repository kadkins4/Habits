import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const mockAll = vi.fn();
  const mockValues = vi.fn(() => Promise.resolve());
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockDeleteWhere = vi.fn(() => Promise.resolve());
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
  const mockWhere = vi.fn(() => mockAll());
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  return { mockAll, mockValues, mockInsert, mockDeleteWhere, mockDelete, mockWhere, mockFrom, mockSelect };
});
const { mockAll, mockInsert, mockDelete } = mocks;

vi.mock("@/db", () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
    delete: mocks.mockDelete,
  },
}));

vi.mock("@/db/schema", () => ({
  completions: {
    date: "date",
    habit_id: "habit_id",
  },
}));

import { GET, POST } from "@/app/api/completions/route";

describe("GET /api/completions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when date param is missing", async () => {
    const request = new Request("http://localhost/api/completions");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("date parameter required");
  });

  it("returns completions for a given date", async () => {
    const completionsData = [
      { id: "c1", habit_id: "h1", date: "2026-02-15" },
      { id: "c2", habit_id: "h2", date: "2026-02-15" },
    ];
    mockAll.mockResolvedValueOnce(completionsData);

    const request = new Request("http://localhost/api/completions?date=2026-02-15");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.completions).toEqual(completionsData);
  });
});

describe("POST /api/completions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts completion and returns 201 when not existing", async () => {
    mockAll.mockResolvedValueOnce([]);

    const request = new Request("http://localhost/api/completions", {
      method: "POST",
      body: JSON.stringify({ habit_id: "h1", date: "2026-02-15" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.completed).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it("deletes completion and returns completed: false when already existing", async () => {
    mockAll.mockResolvedValueOnce([{ id: "c1", habit_id: "h1", date: "2026-02-15" }]);

    const request = new Request("http://localhost/api/completions", {
      method: "POST",
      body: JSON.stringify({ habit_id: "h1", date: "2026-02-15" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.completed).toBe(false);
    expect(mockDelete).toHaveBeenCalled();
  });
});
