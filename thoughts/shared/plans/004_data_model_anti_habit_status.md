# Data Model: Anti-Habit Status Migration

## Overview

Replace the binary `avoided` (0/1) column on `anti_habit_entries` with a `status` text column supporting `"unknown"` | `"avoided"` | `"slipped"` | `"auto_failed"`. This enables the accountability model where anti-habits start each day as `"unknown"` and must be explicitly confirmed. Includes API and UI updates to support the new status flow.

## Current State Analysis

**Schema** (`anti_habit_entries`):
- `avoided`: integer (0/1) — binary toggle
- `temptation_count`: integer — works fine, keep as-is

**API** (`/api/anti-habit-entries`):
- POST accepts `action: "toggle" | "increment" | "decrement"`
- Toggle creates row with `avoided=1` or flips between 0/1

**UI** (`anti-habit-item.tsx`):
- Checkbox-based binary toggle (avoided / not avoided)
- Temptation counter with +/- buttons

**Scoring** (`scoring.ts`):
- Anti-habits are NOT included in scoring at all — scoring only counts `type="habit"`

**Types** (`types.ts`):
- `AntiHabitEntry` inferred from schema (includes `avoided: number`)

## Desired End State

- `anti_habit_entries.status` column: `"unknown"` | `"avoided"` | `"slipped"` | `"auto_failed"`
- `avoided` column removed
- No row for a date = `"unknown"` state (row is only created on first user interaction)
- API supports setting specific status values
- UI shows three interactive states: unknown (default), avoided (success), slipped (setback)
- `auto_failed` is read-only (set by future auto-fail epic, not user-selectable)
- Temptation counter unchanged

## What We're NOT Doing

- Auto-fail logic (separate epic: "Auto-Fail After 3 Days Unknown")
- Day boundary / rollover rules (separate epic)
- Integrating anti-habits into the XP scoring system (separate epic: "Simple Stats v0")
- Changing the habit completion model (keeping row-existence)

## Implementation Approach

Single migration to replace `avoided` with `status`. Since SQLite doesn't support `ALTER COLUMN`, Drizzle will generate a table rebuild migration. We'll map existing data: `avoided=1` -> `"avoided"`, `avoided=0` -> `"unknown"`. The API changes from a binary toggle to explicit status setting. The UI replaces the checkbox with a segmented status control.

---

## Phase 1: Schema Migration

### Overview
Add `status` column, migrate data, remove `avoided` column.

### Changes Required:

#### 1. Schema Update
**File**: `src/db/schema.ts`
**Changes**: Replace `avoided` integer column with `status` text column.

```typescript
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

#### 2. Generate & Apply Migration
- Run `pnpm db:generate` to generate the migration
- Manually verify/edit the generated SQL to ensure data mapping:
  - `avoided = 1` -> `status = 'avoided'`
  - `avoided = 0` -> `status = 'unknown'`
- Run `pnpm db:migrate`

#### 3. Type Updates
**File**: `src/lib/types.ts`
**Changes**: Add `AntiHabitStatus` type.

```typescript
export type AntiHabitStatus = "unknown" | "avoided" | "slipped" | "auto_failed";
```

Note: `AntiHabitEntry` is inferred from schema, so it updates automatically.

### Success Criteria:

#### Automated:
- [x] `pnpm db:generate` succeeds
- [x] `pnpm db:migrate` applies cleanly
- [x] `pnpm build` passes
- [x] `pnpm lint` passes

#### Manual:
- [x] Existing data correctly migrated (avoided=1 -> status="avoided", avoided=0 -> status="unknown")

---

## Phase 2: API Updates

### Overview
Update the anti-habit entries API to work with status values instead of binary toggle.

### Changes Required:

#### 1. API Route
**File**: `src/app/api/anti-habit-entries/route.ts`
**Changes**:
- Replace `action: "toggle"` with `action: "set_status"` + `status` param
- Keep `"increment"` and `"decrement"` actions unchanged
- When setting status to `"unknown"`, delete the row (no row = unknown)
- When setting `"avoided"` or `"slipped"`, upsert the row with that status

```typescript
// New action shape:
type PostBody = {
  habitId: string;
  date: string;
  action: "set_status" | "increment" | "decrement";
  status?: "unknown" | "avoided" | "slipped"; // only for set_status
};
```

**set_status logic**:
- `status = "unknown"`: if row exists, delete it
- `status = "avoided"` or `"slipped"`: upsert row with that status (insert if missing, update if exists)

**increment/decrement logic** (unchanged except column reference):
- Creates row with `status = "unknown"` if no row exists (temptation logged but not yet confirmed)

### Success Criteria:

#### Automated:
- [x] `pnpm build` passes
- [x] `pnpm lint` passes

#### Manual:
- [ ] `POST { action: "set_status", status: "avoided" }` creates/updates entry
- [ ] `POST { action: "set_status", status: "slipped" }` creates/updates entry
- [ ] `POST { action: "set_status", status: "unknown" }` deletes entry
- [ ] `POST { action: "increment" }` still works for temptation counter

---

## Phase 3: UI Updates

### Overview
Replace the binary checkbox with a segmented status control showing unknown/avoided/slipped states.

### Changes Required:

#### 1. Anti-Habit Item Component
**File**: `src/components/habits/anti-habit-item.tsx`
**Changes**: Replace checkbox with a row of status buttons/pills.

**New UI concept:**
- Three small status buttons in a row: "Avoided" | "Slipped"
- Neither selected = unknown (default state)
- Clicking "Avoided" sets status to `"avoided"` (green highlight)
- Clicking "Slipped" sets status to `"slipped"` (amber/orange highlight)
- Clicking the currently active button resets to `"unknown"` (deselects)
- `auto_failed` state shown as a distinct read-only badge (red, no click action)
- Temptation counter stays as-is on the right

**Updated props:**
```typescript
type AntiHabitItemProps = {
  habit: Habit;
  entry: AntiHabitEntry | undefined;
  onSetStatus: (habitId: string, status: AntiHabitStatus) => void;
  onIncrement: (habitId: string) => void;
  onDecrement: (habitId: string) => void;
};
```

**Visual states:**
| Status | Left button | Right button | Row style |
|--------|------------|-------------|-----------|
| `unknown` | "Avoided" (outline) | "Slipped" (outline) | Default border |
| `avoided` | "Avoided" (filled green) | "Slipped" (outline) | Green border/bg |
| `slipped` | "Avoided" (outline) | "Slipped" (filled amber) | Amber border/bg |
| `auto_failed` | Disabled | Disabled | Red border, "Auto-failed" badge |

#### 2. Habit Checklist Wiring
**File**: `src/components/habits/habit-checklist.tsx`
**Changes**:
- Replace `onToggle` calls with `onSetStatus` calls
- Update `postAntiHabitAction` to use new `set_status` action

```typescript
async function setAntiHabitStatus(habitId: string, status: AntiHabitStatus) {
  await fetch("/api/anti-habit-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habitId, date, action: "set_status", status }),
  });
  mutateEntries();
}
```

### Success Criteria:

#### Automated:
- [x] `pnpm build` passes
- [x] `pnpm lint` passes

#### Manual:
- [ ] Anti-habit shows as "unknown" by default (no status selected)
- [ ] Clicking "Avoided" highlights green and persists
- [ ] Clicking "Slipped" highlights amber and persists
- [ ] Clicking active status button resets to unknown
- [ ] Temptation counter still works independently
- [ ] Yesterday drawer anti-habits also work with new UI

---

## Testing Strategy

### Manual Testing Steps:
1. Start fresh: verify anti-habits with no entry show as "unknown" (no button highlighted)
2. Click "Avoided" -> verify green state, refresh -> verify persisted
3. Click "Avoided" again -> verify resets to unknown
4. Click "Slipped" -> verify amber state, refresh -> verify persisted
5. Increment temptation on an unknown entry -> verify row created with status="unknown"
6. Set status on entry with temptations -> verify temptation count preserved
7. Open yesterday drawer -> verify anti-habits show correct status and are interactive
8. Verify existing data migration: previously avoided anti-habits show as "avoided"

### Edge Cases:
- Anti-habit with temptations but no status confirmation (status="unknown", temptation_count > 0)
- Switching between avoided and slipped (should update, not create duplicate)
- Rapid clicking (upsert should handle gracefully)

## Migration Notes

The SQLite migration will rebuild the `anti_habit_entries` table since SQLite doesn't support `ALTER COLUMN`. Drizzle handles this with a create-new-table + copy-data + drop-old + rename pattern. We need to verify the generated migration correctly maps `avoided=1` -> `status='avoided'` and `avoided=0` -> `status='unknown'`, editing the generated SQL if needed.
