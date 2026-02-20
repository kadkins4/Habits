# Data Model (Minimal + Extensible) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the binary `avoided` (0/1) field on anti-habit entries with a multi-state `status` field (`"unknown"` | `"avoided"` | `"slipped"` | `"auto_failed"`), so anti-habits start each day as "unknown" and require explicit confirmation.

**Architecture:** The `anti_habit_entries` table gets a new `status` text column replacing the `avoided` integer. Since SQLite can't drop columns in-place, the migration uses the CREATE-INSERT-DROP-RENAME pattern already established in `0001_add_habit_fields.sql`. The API replaces the `toggle` action with a `setStatus` action, and the UI replaces the checkbox with explicit "Avoided" / "Slipped" status buttons.

**Tech Stack:** Drizzle ORM + SQLite, Next.js App Router API routes, React client components, Tailwind CSS + shadcn/ui

**Scope boundary:** The `auto_failed` status value is included in the type definition but no auto-fail logic is implemented — that's a separate epic. Habit completions (presence-based toggle) are unchanged. Scoring still excludes anti-habits.

---

### Task 1: Schema — Add `status` column, remove `avoided`

**Files:**
- Modify: `src/db/schema.ts:27-39`

**Step 1: Update the Drizzle schema**

Replace the `avoided` integer column with a `status` text column:

```ts
export const antiHabitEntries = sqliteTable(
  "anti_habit_entries",
  {
    id: text("id").primaryKey(),
    habit_id: text("habit_id").notNull(),
    date: text("date").notNull(),
    status: text("status").notNull().default("unknown"),
    temptation_count: integer("temptation_count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("anti_habit_entries_habit_date_idx").on(table.habit_id, table.date),
  ]
);
```

**Step 2: Generate the migration**

Run: `pnpm db:generate`
Expected: A new migration SQL file in `src/db/migrations/`

**Step 3: Verify the generated migration**

Read the generated SQL file. It should use the CREATE-INSERT-DROP-RENAME pattern (SQLite can't drop columns). If Drizzle generates something unexpected, manually write the migration using the same pattern as `0001_add_habit_fields.sql`:

```sql
CREATE TABLE `anti_habit_entries_new` (
  `id` text PRIMARY KEY NOT NULL,
  `habit_id` text NOT NULL,
  `date` text NOT NULL,
  `status` text NOT NULL DEFAULT 'unknown',
  `temptation_count` integer NOT NULL DEFAULT 0
);

INSERT INTO `anti_habit_entries_new` (`id`, `habit_id`, `date`, `status`, `temptation_count`)
SELECT `id`, `habit_id`, `date`,
  CASE WHEN `avoided` = 1 THEN 'avoided' ELSE 'unknown' END,
  `temptation_count`
FROM `anti_habit_entries`;

DROP TABLE `anti_habit_entries`;
ALTER TABLE `anti_habit_entries_new` RENAME TO `anti_habit_entries`;
CREATE UNIQUE INDEX `anti_habit_entries_habit_date_idx` ON `anti_habit_entries` (`habit_id`, `date`);
```

Key data migration rules:
- `avoided = 1` → `status = "avoided"`
- `avoided = 0` → `status = "unknown"` (can't distinguish "never touched" from "explicitly reset" in historical data, so default to unknown)

**Step 4: Apply the migration**

Run: `pnpm db:migrate`
Expected: Migration applies cleanly

**Step 5: Verify build still compiles**

Run: `pnpm build`
Expected: Build will FAIL at this point because the API route and components still reference `avoided`. That's expected — we fix them in subsequent tasks.

**Step 6: Commit**

```
feat: replace avoided column with status on anti_habit_entries
```

---

### Task 2: Types — Add `AntiHabitStatus` type

**Files:**
- Modify: `src/lib/types.ts:1-7`

**Step 1: Add the status union type**

Add after the existing type aliases (after line 13):

```ts
export type AntiHabitStatus = "unknown" | "avoided" | "slipped" | "auto_failed";
```

Note: `AntiHabitEntry` is inferred from the schema (`typeof antiHabitEntries.$inferSelect`), so it automatically picks up the new `status` field and drops `avoided`. No change needed for that type.

**Step 2: Verify types compile**

Run: `pnpm build`
Expected: Still fails (API route + components not updated yet), but `types.ts` itself should have no errors.

**Step 3: Commit**

```
feat: add AntiHabitStatus type
```

---

### Task 3: API Route — Replace `toggle` with `setStatus`

**Files:**
- Modify: `src/app/api/anti-habit-entries/route.ts`

**Step 1: Update the POST handler**

Replace the entire `route.ts` with:

```ts
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { antiHabitEntries } from "@/db/schema";
import type { AntiHabitStatus } from "@/lib/types";

const VALID_STATUSES: AntiHabitStatus[] = ["unknown", "avoided", "slipped"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const entries = await db
      .select()
      .from(antiHabitEntries)
      .where(eq(antiHabitEntries.date, date));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET /api/anti-habit-entries failed:", error);
    return NextResponse.json({ error: "Failed to fetch anti-habit entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { habitId, date, action } = body as {
      habitId: string;
      date: string;
      action: "setStatus" | "increment" | "decrement";
    };

    const existing = await db
      .select()
      .from(antiHabitEntries)
      .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
      .get();

    if (action === "setStatus") {
      const { status } = body as { status: AntiHabitStatus };
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      if (!existing) {
        await db.insert(antiHabitEntries)
          .values({ id: crypto.randomUUID(), habit_id: habitId, date, status, temptation_count: 0 })
          .run();
      } else {
        await db.update(antiHabitEntries)
          .set({ status })
          .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
          .run();
      }
    } else if (action === "increment") {
      if (!existing) {
        await db.insert(antiHabitEntries)
          .values({ id: crypto.randomUUID(), habit_id: habitId, date, status: "unknown", temptation_count: 1 })
          .run();
      } else {
        await db.update(antiHabitEntries)
          .set({ temptation_count: existing.temptation_count + 1 })
          .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
          .run();
      }
    } else if (action === "decrement") {
      if (existing && existing.temptation_count > 0) {
        await db.update(antiHabitEntries)
          .set({ temptation_count: existing.temptation_count - 1 })
          .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
          .run();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/anti-habit-entries failed:", error);
    return NextResponse.json({ error: "Failed to update anti-habit entry" }, { status: 500 });
  }
}
```

Key changes:
- `toggle` action → `setStatus` action that accepts an explicit `status` value
- `VALID_STATUSES` array excludes `"auto_failed"` — that status is only set programmatically (future epic)
- `increment`/`decrement` actions are unchanged except they now set `status: "unknown"` instead of `avoided: 0` on insert

**Step 2: Verify build**

Run: `pnpm build`
Expected: Still fails — UI component still references `avoided` and `onToggle`. Next task fixes that.

**Step 3: Commit**

```
feat: replace toggle action with setStatus in anti-habit-entries API
```

---

### Task 4: UI — Replace checkbox with status controls

**Files:**
- Modify: `src/components/habits/anti-habit-item.tsx`

**Step 1: Rewrite the AntiHabitItem component**

Replace the entire file with a component that shows three status states:

```tsx
"use client";

import type { Habit, AntiHabitEntry, AntiHabitStatus } from "@/lib/types";

type AntiHabitItemProps = {
  habit: Habit;
  entry: AntiHabitEntry | undefined;
  onSetStatus: (habitId: string, status: AntiHabitStatus) => void;
  onIncrement: (habitId: string) => void;
  onDecrement: (habitId: string) => void;
};

function statusLabel(status: AntiHabitStatus): string {
  switch (status) {
    case "avoided": return "Avoided";
    case "slipped": return "Slipped";
    case "auto_failed": return "Missed";
    default: return "Unconfirmed";
  }
}

export function AntiHabitItem({ habit, entry, onSetStatus, onIncrement, onDecrement }: AntiHabitItemProps) {
  const status: AntiHabitStatus = (entry?.status as AntiHabitStatus) ?? "unknown";
  const temptationCount = entry?.temptation_count ?? 0;

  const borderClass =
    status === "avoided" ? "border-success/30 bg-success/5" :
    status === "slipped" ? "border-destructive/30 bg-destructive/5" :
    status === "auto_failed" ? "border-destructive/30 bg-destructive/5" :
    "";

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${borderClass}`}>
      <div className="flex-1 min-w-0">
        <span className={status === "avoided" ? "line-through text-muted-foreground" : ""}>
          {habit.name}
        </span>
        <span className="ml-2 text-xs text-muted-foreground">
          {statusLabel(status)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onSetStatus(habit.id, status === "avoided" ? "unknown" : "avoided")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            status === "avoided"
              ? "bg-success text-success-foreground"
              : "bg-muted hover:bg-success/20"
          }`}
          aria-label={status === "avoided" ? "Reset to unconfirmed" : "Mark as avoided"}
        >
          Avoided
        </button>
        <button
          onClick={() => onSetStatus(habit.id, status === "slipped" ? "unknown" : "slipped")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            status === "slipped"
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted hover:bg-destructive/20"
          }`}
          aria-label={status === "slipped" ? "Reset to unconfirmed" : "Mark as slipped"}
        >
          Slipped
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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

Key changes:
- Removed: Checkbox, row-click toggle, `onToggle` prop
- Added: "Avoided" and "Slipped" toggle buttons, `onSetStatus` prop
- Clicking an already-active status button resets to "unknown" (toggle behavior)
- `auto_failed` entries show as read-only "Missed" label (no button to set it — future epic)
- Visual states: green border for avoided, red border for slipped/auto_failed, neutral for unknown

**Step 2: Commit**

```
feat: replace anti-habit checkbox with status buttons
```

---

### Task 5: Checklist — Update action dispatch

**Files:**
- Modify: `src/components/habits/habit-checklist.tsx:44-51, 131-139`

**Step 1: Update `postAntiHabitAction` to support `setStatus`**

Replace lines 44-51:

```ts
async function postAntiHabitAction(habitId: string, action: string, status?: AntiHabitStatus) {
  await fetch("/api/anti-habit-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habitId, date, action, ...(status ? { status } : {}) }),
  });
  mutateEntries();
}
```

Add the `AntiHabitStatus` import at the top:

```ts
import type { Habit, Completion, AntiHabitEntry, AntiHabitStatus } from "@/lib/types";
```

**Step 2: Update AntiHabitItem rendering**

Replace the `onToggle` prop with `onSetStatus` in the JSX (lines ~131-139):

```tsx
<AntiHabitItem
  key={habit.id}
  habit={habit}
  entry={entryMap.get(habit.id)}
  onSetStatus={(id, status) => postAntiHabitAction(id, "setStatus", status)}
  onIncrement={(id) => postAntiHabitAction(id, "increment")}
  onDecrement={(id) => postAntiHabitAction(id, "decrement")}
/>
```

**Step 3: Verify full build passes**

Run: `pnpm build`
Expected: PASS — all references to `avoided` and `onToggle` are gone

**Step 4: Run lint**

Run: `pnpm lint`
Expected: PASS

**Step 5: Commit**

```
feat: wire up setStatus action in habit checklist
```

---

### Task 6: Seed — Update seed data for new schema

**Files:**
- Modify: `src/db/seed.ts`

**Step 1: Update seed script**

Find where anti-habit entries are seeded (if any). Update `avoided: 1` → `status: "avoided"` and `avoided: 0` → `status: "unknown"`. If the seed creates anti-habit entry rows, ensure they use the `status` field instead of `avoided`.

If the seed only creates habits and completions (no anti-habit entries), verify it still works:

Run: `pnpm db:seed`
Expected: PASS — seed script runs without errors

**Step 2: Commit**

```
chore: update seed data for status field
```

---

### Task 7: Verify — End-to-end check

**Step 1: Full build + lint**

Run: `pnpm lint && pnpm build`
Expected: Both pass with zero errors

**Step 2: Manual smoke test**

Run: `pnpm dev`

Verify:
1. Anti-habits show "Avoided" and "Slipped" buttons (no checkbox)
2. Clicking "Avoided" turns the row green and button active
3. Clicking "Avoided" again resets to unknown
4. Clicking "Slipped" turns the row red and button active
5. Temptation counter still works independently
6. Regular habits still work with checkbox toggle (unchanged)
7. Yesterday drawer shows anti-habits correctly

**Step 3: Update FEATURES.md**

Move the "Data Model (Minimal + Extensible)" epic heading to the **Done** section (heading only, no description per project tracking rules). Remove it from the MVP backlog section.

**Step 4: Commit**

```
chore: mark data model epic as done
```
