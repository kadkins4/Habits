# Yesterday Mode (1-Day Grace) Implementation Plan

## Overview
Replace the current inline today/yesterday toggle with a glass-style bottom drawer. The TodayCard always shows today's view. Tapping "Yesterday" (or the pending banner) opens a translucent drawer containing yesterday's full checklist. Confirming closes the drawer and returns to today.

## Current State Analysis
- `TodayCard` uses `useDateToggle()` to swap the entire card between today/yesterday views inline
- `DateToggle` is a pill button that toggles `view` state between `"today"` and `"yesterday"`
- `PendingBanner` shows unconfirmed count but is not clickable
- `ConfirmYesterdayButton` appears inline at the bottom of the card when viewing yesterday
- `HabitChecklist` already accepts `date` and `isYesterday` props — fully reusable
- `DailyProgress` already accepts `date` prop — fully reusable
- No Drawer/Sheet component exists yet (only Dialog)

## Desired End State
- TodayCard **always** shows today's date, habits, and progress
- A "Yesterday" button in the card header opens a **glass-style bottom drawer**
- The `PendingBanner` is clickable and also opens the drawer
- The drawer contains: yesterday's `HabitChecklist`, `DailyProgress`, and a confirm button
- Confirming closes the drawer, marks yesterday as reviewed (localStorage), and hides the pending banner
- The drawer has a frosted glass / translucent aesthetic (backdrop-blur + semi-transparent background)

## What We're NOT Doing
- Editing any day other than yesterday (hard rule — only yesterday is editable)
- Changing the completions API or database schema
- Adding day boundary logic (separate epic)
- Changing scoring/streak logic

## Implementation Approach
1. Add the shadcn Drawer component (uses `vaul` library under the hood)
2. Create a `YesterdayDrawer` component that wraps the existing checklist + progress + confirm button
3. Apply glassmorphism styles to the drawer overlay and content
4. Simplify `TodayCard` — remove inline yesterday view, add drawer trigger
5. Make `PendingBanner` clickable as a secondary drawer trigger
6. Simplify `useDateToggle` — remove `view`/`setView`/`isYesterday` (no longer needed for inline toggling)
7. Remove `DateToggle` component (no longer needed)

---

## Phase 1: Add Drawer Component

### Overview
Install the shadcn Drawer primitive and apply glassmorphism styling.

### Changes Required:

#### 1. Install shadcn Drawer
Run: `pnpm dlx shadcn@latest add drawer`

This will:
- Install `vaul` as a dependency
- Create `src/components/ui/drawer.tsx`

#### 2. Add glassmorphism utility class
**File**: `src/app/globals.css`

Add a utility class for the glass effect:
```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### 3. Style the Drawer content
**File**: `src/components/ui/drawer.tsx`

After shadcn generates it, update `DrawerContent` to apply glass styling. Override the default opaque background with the translucent glass class. The overlay should also be slightly more transparent than the default.

### Success Criteria:
- [ ] `pnpm build` passes
- [ ] Drawer component exists at `src/components/ui/drawer.tsx`
- [ ] `vaul` is in `package.json` dependencies

---

## Phase 2: Create YesterdayDrawer Component

### Overview
Build the drawer that contains yesterday's full checklist, progress, and confirm button.

### Changes Required:

#### 1. Create YesterdayDrawer
**File**: `src/components/habits/yesterday-drawer.tsx`

```tsx
"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { DailyProgress } from "@/components/stats/daily-progress";
import { Button } from "@/components/ui/button";

type YesterdayDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yesterdayDate: string;
  displayDate: string;
  isConfirmed: boolean;
  onConfirm: () => void;
};

export function YesterdayDrawer({
  open,
  onOpenChange,
  yesterdayDate,
  displayDate,
  isConfirmed,
  onConfirm,
}: YesterdayDrawerProps) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Yesterday — {displayDate}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-6 overflow-y-auto">
          {open ? (
            <>
              <HabitChecklist date={yesterdayDate} isYesterday />
              <DailyProgress date={yesterdayDate} />
              {isConfirmed ? (
                <p className="text-sm text-center text-muted-foreground py-2">
                  Yesterday reviewed
                </p>
              ) : (
                <Button
                  onClick={handleConfirm}
                  className="w-full"
                  variant="outline"
                >
                  Confirm yesterday
                </Button>
              )}
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

Key decisions:
- Controlled via `open`/`onOpenChange` (matches existing dialog pattern)
- `{open ? ... : null}` to unmount content when closed (resets SWR state)
- Confirm handler calls `onConfirm()` then closes the drawer
- `max-h-[85vh]` + `overflow-y-auto` for scrollable content on small screens
- Reuses `HabitChecklist` and `DailyProgress` directly — no duplication

### Success Criteria:
- [ ] Component renders without errors
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes

---

## Phase 3: Update TodayCard and PendingBanner

### Overview
Wire up the drawer, simplify TodayCard to always show today, and make PendingBanner clickable.

### Changes Required:

#### 1. Simplify `useDateToggle`
**File**: `src/lib/use-date-toggle.ts`

Remove `view`, `setView`, `isYesterday`, `date`, `displayDate` from the hook since TodayCard no longer toggles views. The hook becomes a simpler "yesterday state" hook.

Rename to `useYesterday` and export:
- `yesterdayDate: string` — the YYYY-MM-DD for yesterday
- `yesterdayDisplayDate: string` — human-readable display date for yesterday
- `isYesterdayConfirmed: boolean` — from localStorage
- `confirmYesterday: () => void` — writes to localStorage

Also export `DateView` type removal and the `getYesterdayDate` function (still used).

#### 2. Update TodayCard
**File**: `src/components/habits/today-card.tsx`

- Remove `DateToggle` import and usage
- Replace inline yesterday view with `YesterdayDrawer`
- Add `useState` for drawer open state
- Add a "Yesterday" button in the header (replacing DateToggle)
- Always pass today's date to `HabitChecklist` and `DailyProgress`
- Make `PendingBanner` open the drawer on click

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { DailyProgress } from "@/components/stats/daily-progress";
import { StreakCounter } from "@/components/stats/streak-counter";
import { PendingBanner } from "@/components/habits/pending-banner";
import { YesterdayDrawer } from "@/components/habits/yesterday-drawer";
import { useYesterday } from "@/lib/use-yesterday";
import { formatDate } from "@/lib/types";

export function TodayCard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    yesterdayDate,
    yesterdayDisplayDate,
    isYesterdayConfirmed,
    confirmYesterday,
  } = useYesterday();

  const today = formatDate(new Date());
  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              TODAY — {todayDisplay}
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-xs font-medium px-2.5 py-1 rounded-full border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Yesterday
              </button>
            </span>
            <StreakCounter />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PendingBanner
            yesterdayDate={yesterdayDate}
            isYesterdayConfirmed={isYesterdayConfirmed}
            onOpen={() => setDrawerOpen(true)}
          />
          <HabitChecklist date={today} />
          <DailyProgress date={today} />
        </CardContent>
      </Card>

      <YesterdayDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        yesterdayDate={yesterdayDate}
        displayDate={yesterdayDisplayDate}
        isConfirmed={isYesterdayConfirmed}
        onConfirm={confirmYesterday}
      />
    </>
  );
}
```

#### 3. Update PendingBanner — make it clickable
**File**: `src/components/habits/pending-banner.tsx`

Add an `onOpen` prop. Wrap the banner content in a clickable button/div with hover effect and cursor-pointer so tapping it opens the drawer.

```tsx
type PendingBannerProps = {
  yesterdayDate: string;
  isYesterdayConfirmed: boolean;
  onOpen: () => void;
};
```

The banner becomes a `<button>` element with the same styling plus `cursor-pointer` and a hover state.

#### 4. Delete DateToggle component
**File**: `src/components/habits/date-toggle.tsx` — **Delete this file**

No longer needed since TodayCard no longer toggles inline views.

#### 5. Delete ConfirmYesterdayButton component
**File**: `src/components/habits/confirm-yesterday-button.tsx` — **Delete this file**

The confirm button is now inline in `YesterdayDrawer`. This standalone component is no longer used.

#### 6. Rename `use-date-toggle.ts` to `use-yesterday.ts`
**File**: `src/lib/use-date-toggle.ts` → `src/lib/use-yesterday.ts`

Rename the file and the exported hook to `useYesterday`. Remove the `DateView` type export, `view`/`setView` state, and all "today vs yesterday" branching. Keep only the yesterday-related logic.

### Success Criteria:

#### Automated Verification:
- [ ] `pnpm lint` passes (no unused imports, no missing imports)
- [ ] `pnpm build` passes

#### Manual Verification:
- [ ] TodayCard always shows today's date and checklist
- [ ] "Yesterday" pill button in header opens the glass drawer
- [ ] PendingBanner is clickable and opens the drawer
- [ ] Drawer shows yesterday's habits, anti-habits, progress, and confirm button
- [ ] Toggling habits inside the drawer works correctly
- [ ] Clicking "Confirm yesterday" marks it as reviewed and closes the drawer
- [ ] After confirming, PendingBanner disappears
- [ ] Reopening the drawer shows "Yesterday reviewed" text instead of button
- [ ] Drawer has frosted glass / translucent appearance
- [ ] Drawer is scrollable if content exceeds viewport

---

## Phase 4: Cleanup

### Overview
Remove dead code references and verify no imports are broken.

### Changes Required:

#### 1. Check for stale imports
Search the codebase for any remaining imports of:
- `DateToggle`
- `ConfirmYesterdayButton`
- `useDateToggle`
- `DateView` type

Fix or remove any found.

#### 2. Update FEATURES.md
Move "Yesterday Mode (1-Day Grace)" from **MVP backlog** to **In Progress** (or **Done** after completion).

### Success Criteria:
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] No references to deleted files remain

---

## Testing Strategy

### Manual Testing Steps:
1. Load the dashboard — verify it shows "TODAY" with today's date
2. Click the "Yesterday" pill — verify the drawer slides up with glass styling
3. Toggle a habit checkbox inside the drawer — verify it persists
4. Click "Confirm yesterday" — verify the drawer closes
5. Verify the PendingBanner disappears after confirming
6. Click "Yesterday" again — verify it shows "Yesterday reviewed"
7. Click the PendingBanner (before confirming) — verify the drawer opens
8. Resize the window to mobile width — verify drawer is scrollable
9. Check that today's checklist is unaffected by drawer interactions

## Migration Notes
- `localStorage` key `"yesterday-confirmed"` is unchanged — no data migration needed
- The `useDateToggle` → `useYesterday` rename is a breaking change for any file importing it, but the codebase search shows only `today-card.tsx` imports it
- `DateView` type is only imported by `date-toggle.tsx` which is being deleted
