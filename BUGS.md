# Bugs

Tracked bugs in Gamified Habits. Items move through: **Next** -> **Done**.

Priority levels: **P1** (blocking / broken core functionality), **P2** (degraded experience), **P3** (minor annoyance).

---

## Next

_(none)_

---

## Done

### P1 — Day progress does not update on toggle
Root cause was a timezone mismatch: completions were stored using local date (`getFullYear/getMonth/getDate`) but the stats API used `toISOString().split("T")[0]` (UTC). In US timezones, UTC date could differ from local date, so daily stats query missed today's completions. Fixed by using `formatDate()` (local time) in the stats route.

**File:** `src/app/api/stats/route.ts`

### P1 — Checkbox click does not toggle habit completion
Clicking directly on the checkbox doesn't mark the habit as complete. Only clicking the habit name works. The root cause was a double-toggle — the parent div's `onClick` and the checkbox's `onCheckedChange` both fired, toggling twice. Fixed by replacing `onCheckedChange` with `onClick` + `e.stopPropagation()` on the checkbox.

**File:** `src/components/habits/habit-checklist.tsx`
