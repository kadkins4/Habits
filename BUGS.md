# Bugs

Tracked bugs in Gamified Habits. Items move through: **Next** -> **Done**.

Priority levels: **P1** (blocking / broken core functionality), **P2** (degraded experience), **P3** (minor annoyance).

---

## Next

### P1 — Day progress does not update on toggle
Marking or unmarking a habit does not update the day progress card. The `toggleHabit` function calls `mutateCompletions()` and `mutateStats()` after the API call, which should trigger SWR revalidation. Need to verify the stats API response and confirm the `mutateStats` key is wired up correctly — likely a stale SWR key or missing revalidation.

**Files:** `src/components/habits/habit-checklist.tsx`, `src/components/stats/daily-progress.tsx`, `src/lib/api.ts`

---

## Done

### P1 — Checkbox click does not toggle habit completion
Clicking directly on the checkbox doesn't mark the habit as complete. Only clicking the habit name works. The root cause was a double-toggle — the parent div's `onClick` and the checkbox's `onCheckedChange` both fired, toggling twice. Fixed by replacing `onCheckedChange` with `onClick` + `e.stopPropagation()` on the checkbox.

**File:** `src/components/habits/habit-checklist.tsx`
