# Habit & Anti-Habit Checklist (Binary v1) — Implementation Plan

## Overview

Split the daily checklist into two distinct sections: a **Habits** section (existing binary toggle) and an **Anti-Habits** section (binary avoided/not-avoided toggle + temptation counter). Anti-habits get a new dedicated data table and are excluded from XP scoring in this v1.

---

## Current State Analysis

- `habits` table already has `type: "habit" | "antihabit"` — the data model supports it
- `completions` table is purely binary (row = done, no row = not done) and covers all habit types
- `HabitChecklist` renders all active habits the same way, ignoring `type`
- `calculateDailyScore` counts **all** active habits for XP — anti-habits incorrectly contribute to scoring
- No separate data model or UI for anti-habits exists

## Desired End State

1. The today card shows two labeled sections: **Habits** (top) and **Anti-Habits** (bottom)
2. Regular habits use the existing binary checkbox toggle (unchanged behavior)
3. Anti-habits show a binary "Avoided" toggle + a temptation counter (`-` count `+`)
4. Anti-habit state persists in a new `anti_habit_entries` table
5. XP scoring and the day progress bar reflect only regular habits

## What We're NOT Doing

- No `unknown` / `slipped` / `auto_failed` status states — those come in a later epic
- No XP awarded for avoided anti-habits (v1 excludes them from scoring entirely)
- No anti-habit-specific streak tracking (a later stats epic)
- No changes to the Kanban/manage-habits page

---

## Phase 1: Database Schema + Migration

### Overview
Add the `anti_habit_entries` table with `avoided` (binary) and `temptation_count` columns.

### Changes Required

#### 1. Schema
**File**: `src/db/schema.ts`

Add after the `completions` table:

```typescript
export const antiHabitEntries = sqliteTable(
  "anti_habit_entries",
  {
    id: text("id").primaryKey(),
    habit_id: text("habit_id").notNull(),
    date: text("date").notNull(),
    avoided: integer("avoided").notNull().default(0),
    temptation_count: integer("temptation_count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("anti_habit_entries_habit_date_idx").on(table.habit_id, table.date),
  ]
);
```

#### 2. Run migration
```bash
pnpm db:generate
pnpm db:migrate
```

### Success Criteria
- [x] `pnpm db:migrate` runs without error
- [x] `anti_habit_entries` table exists in the SQLite file with the correct columns

---

## Phase 2: API Route

### Overview
New route handling GET (fetch entries for a date) and POST (toggle avoided / increment / decrement temptation count).

### Changes Required

#### 1. New route
**File**: `src/app/api/anti-habit-entries/route.ts`

```typescript
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { antiHabitEntries } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const entries = db
    .select()
    .from(antiHabitEntries)
    .where(eq(antiHabitEntries.date, date))
    .all();

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { habitId, date, action } = body as {
    habitId: string;
    date: string;
    action: "toggle" | "increment" | "decrement";
  };

  const existing = db
    .select()
    .from(antiHabitEntries)
    .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
    .get();

  if (action === "toggle") {
    if (!existing) {
      db.insert(antiHabitEntries)
        .values({ id: crypto.randomUUID(), habit_id: habitId, date, avoided: 1, temptation_count: 0 })
        .run();
    } else {
      db.update(antiHabitEntries)
        .set({ avoided: existing.avoided === 1 ? 0 : 1 })
        .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
        .run();
    }
  } else if (action === "increment") {
    if (!existing) {
      db.insert(antiHabitEntries)
        .values({ id: crypto.randomUUID(), habit_id: habitId, date, avoided: 0, temptation_count: 1 })
        .run();
    } else {
      db.update(antiHabitEntries)
        .set({ temptation_count: existing.temptation_count + 1 })
        .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
        .run();
    }
  } else if (action === "decrement") {
    if (existing && existing.temptation_count > 0) {
      db.update(antiHabitEntries)
        .set({ temptation_count: existing.temptation_count - 1 })
        .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
        .run();
    }
  }

  return NextResponse.json({ ok: true });
}
```

### Success Criteria
- [x] `GET /api/anti-habit-entries?date=2026-02-18` returns `{ entries: [] }`
- [x] `POST` with `action: "toggle"` creates a row with `avoided=1` on first call, flips to `avoided=0` on second
- [x] `POST` with `action: "increment"` creates/updates `temptation_count`
- [x] `POST` with `action: "decrement"` decrements but never below 0

---

## Phase 3: Types & SWR Hook

### Overview
Add the `AntiHabitEntry` type (inferred from schema) and a SWR hook to fetch entries for a given date.

### Changes Required

#### 1. Add type
**File**: `src/lib/types.ts`

Add after the `Completion` type:

```typescript
import type { habits, completions, antiHabitEntries } from "@/db/schema";

export type AntiHabitEntry = typeof antiHabitEntries.$inferSelect;
```

Note: update the existing import at the top of the file to include `antiHabitEntries`.

#### 2. Add hook
**File**: `src/lib/api.ts`

Add after `useCompletions`:

```typescript
export function useAntiHabitEntries(date: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/anti-habit-entries?date=${date}`,
    fetcher
  );
  return {
    entries: data?.entries ?? [],
    isLoading,
    error,
    mutate,
  };
}
```

### Success Criteria
- [x] TypeScript compiles without errors
- [x] `useAntiHabitEntries("2026-02-18")` returns the correct shape

---

## Phase 4: Exclude Anti-Habits from Scoring

### Overview
`calculateDailyScore` currently counts all active habits. Add a `type = "habit"` filter so anti-habits are excluded from XP and progress calculations.

### Changes Required

#### 1. Update scoring query
**File**: `src/lib/scoring.ts`

```typescript
// Before
.where(and(eq(habits.status, "active"), lte(habits.created_at, date + "T23:59:59.999Z")))

// After
.where(and(
  eq(habits.status, "active"),
  eq(habits.type, "habit"),
  lte(habits.created_at, date + "T23:59:59.999Z")
))
```

### Success Criteria
- [x] Adding an anti-habit does not change the "possible" XP shown in the progress bar
- [x] Toggling an anti-habit as avoided does not change earned XP

---

## Phase 5: UI — Split Checklist

### Overview
- Create `AntiHabitItem` component for the anti-habit row (avoided toggle + temptation counter)
- Refactor `HabitChecklist` to split habits by type and render two labeled sections

### Changes Required

#### 1. New component
**File**: `src/components/habits/anti-habit-item.tsx`

```typescript
"use client";

import type { Habit, AntiHabitEntry } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

type AntiHabitItemProps = {
  habit: Habit;
  entry: AntiHabitEntry | undefined;
  onToggle: (habitId: string) => void;
  onIncrement: (habitId: string) => void;
  onDecrement: (habitId: string) => void;
};

export function AntiHabitItem({ habit, entry, onToggle, onIncrement, onDecrement }: AntiHabitItemProps) {
  const isAvoided = entry?.avoided === 1;
  const temptationCount = entry?.temptation_count ?? 0;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isAvoided ? "border-success/30 bg-success/5" : ""
      }`}
    >
      <Checkbox
        checked={isAvoided}
        onClick={() => onToggle(habit.id)}
        tabIndex={-1}
      />
      <span className={isAvoided ? "line-through text-muted-foreground" : ""}>
        {habit.name}
      </span>
      <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
        <button
          onClick={() => onDecrement(habit.id)}
          className="w-6 h-6 rounded hover:bg-accent flex items-center justify-center disabled:opacity-40"
          disabled={temptationCount === 0}
          aria-label="Decrease temptation count"
        >
          −
        </button>
        <span className="w-5 text-center tabular-nums">{temptationCount}</span>
        <button
          onClick={() => onIncrement(habit.id)}
          className="w-6 h-6 rounded hover:bg-accent flex items-center justify-center"
          aria-label="Increase temptation count"
        >
          +
        </button>
        <span className="text-xs ml-0.5">temptations</span>
      </div>
    </div>
  );
}
```

#### 2. Refactor `HabitChecklist`
**File**: `src/components/habits/habit-checklist.tsx`

Key changes:
- Import `useAntiHabitEntries` and `AntiHabitItem`
- Split `habits` into `regularHabits` (type="habit") and `antiHabits` (type="antihabit")
- Add `toggleAntiHabit`, `incrementTemptation`, `decrementTemptation` handlers that POST to `/api/anti-habit-entries`
- Render two sections: "Habits" and "Anti-Habits", each with its own empty state
- Empty state for anti-habits: "No anti-habits yet."
- Section headings only render when at least one item exists in either group (or both groups have items — show both regardless)

The keyboard navigation `handleKeyDown` should only apply to the regular habits section (arrow keys navigate within that list). Anti-habit items are interactive but don't need the same keyboard UX.

**Section heading style**: small muted uppercase label (e.g., `text-xs font-semibold uppercase tracking-wide text-muted-foreground`) above each list.

### Success Criteria
- [x] When a user has only regular habits, the "Habits" section renders and "Anti-Habits" shows empty state
- [x] When a user has only anti-habits, "Habits" shows empty state and "Anti-Habits" renders
- [x] Clicking the avoided checkbox toggles it visually and persists via the API
- [x] Clicking `+` increments the temptation counter; `-` decrements (clamped at 0)
- [x] Completing a regular habit still updates the daily progress bar
- [x] Toggling anti-habit avoided does NOT change the daily progress bar
- [x] `pnpm lint` passes
- [x] `pnpm build` passes

---

## Testing Strategy

### Manual Testing Steps
1. Add a regular habit and an anti-habit via Manage Habits
2. Navigate to today — verify two labeled sections appear
3. Toggle the regular habit — confirm progress bar updates, XP increments
4. Toggle the anti-habit as avoided — confirm no change to progress bar or XP
5. Click `+` on the anti-habit temptation counter — confirm count increases
6. Click `-` — confirm count decreases, stops at 0
7. Refresh the page — confirm all states persisted correctly
8. Switch to Yesterday view — confirm both sections show yesterday's state

## Performance Considerations

No concerns. Anti-habit entries are fetched with a date-filtered query identical in shape to completions. The new table is small.

## Migration Notes

Existing anti-habits in the `completions` table (if any were toggled prior to this change) will no longer contribute to scoring. They won't automatically appear as "avoided" in the new `anti_habit_entries` table — they'll start fresh. This is acceptable for a local dev app with seed data.
