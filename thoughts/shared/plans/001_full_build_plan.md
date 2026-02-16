# Gamified Habits — Full Build Plan

## Overview

Build a gamified habit-tracking dashboard from scratch using Next.js 15, SQLite (Drizzle ORM), Tailwind CSS v3, and shadcn/ui. The app lets users define habits with XP values, check them off daily, and see progress via daily/weekly/monthly score cards with streaks and celebrations.

## Current State Analysis

- Empty project directory with only a `DESIGN.md`, framework scaffolding (`.claude/`, `thoughts/`), and no code
- No git repo initialized
- No `CLAUDE.md`
- No `package.json`
- Node.js 22.15.0 and npm 10.9.2 are installed
- pnpm needs to be installed

## Desired End State

A fully functional single-page habit dashboard matching the DESIGN.md spec:
- Habit CRUD via modal/drawer
- Daily checklist with XP and progress bar
- Weekly/monthly score cards
- Streak counter
- Celebration banners
- SQLite database, API routes, SWR data fetching
- Clean git commit history

## What We're NOT Doing

- Authentication / multi-user support
- Deployment (Vercel, etc.) — local dev only for now
- Automated tests (will add in a future pass)
- CI/CD pipeline
- Dark mode
- PWA / mobile app
- GitHub repo creation (will push manually later)

## Tech Decisions

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 15 |
| Database | SQLite via Drizzle ORM | latest |
| SQLite Driver | better-sqlite3 | latest |
| Styling | Tailwind CSS + shadcn/ui | v3 + latest |
| Language | TypeScript | 5.x |
| State/Fetching | SWR | latest |
| Package Manager | pnpm | latest |
| Node.js | 22 LTS | 22.15.0 |

## Key Design Decisions

1. **Completions model**: Row exists = habit completed for that day. No `completed` boolean column. Insert row to complete, delete row to uncomplete.
2. **Scoring**: Per-day accurate tracking. A habit only contributes to a day's max XP if `created_at <= that_day`. Uses the habit's `created_at` date as the lower bound.
3. **UUIDs**: Use `crypto.randomUUID()` (built into Node 22) — no `uuid` package needed.
4. **Tailwind v3**: For stable shadcn/ui compatibility.
5. **No GitHub push**: Local git only for now.

---

## Phase 1: Tooling + Git Init + CLAUDE.md

### Goal
Install pnpm, initialize git repo, and create the CLAUDE.md file.

### Steps

#### Step 1.1: Install pnpm
- Run `npm install -g pnpm`
- Verify with `pnpm --version`

#### Step 1.2: Initialize git repo
- Run `git init`
- Create `.gitignore` with standard Next.js ignores:
  ```
  node_modules/
  .next/
  out/
  data/
  *.db
  .env*
  .DS_Store
  ```
- Commit: `chore: initialize git repo with .gitignore`

#### Step 1.3: Create CLAUDE.md
- Create `CLAUDE.md` at project root with:
  - Project description (one paragraph)
  - Tech stack summary
  - Directory structure conventions
  - Code style rules:
    - Always use TypeScript strict mode
    - Use `type` over `interface` unless extending
    - Use named exports, not default exports
    - Use absolute imports via `@/` alias
    - Prefer `async/await` over `.then()`
    - Use Drizzle query builder, never raw SQL
  - Commit rules:
    - Conventional commits (feat:, fix:, chore:, etc.)
    - Each commit should be atomic and buildable
    - Always run `pnpm lint` before committing — fix any errors
    - Always run `pnpm build` before committing — fix any errors
  - Commands reference:
    - `pnpm dev` — start dev server
    - `pnpm build` — production build
    - `pnpm lint` — run ESLint
    - `pnpm db:generate` — generate Drizzle migrations
    - `pnpm db:migrate` — apply migrations
    - `pnpm db:seed` — seed example data
- Commit: `chore: add CLAUDE.md with project conventions`

### Success Criteria
- [x] pnpm is installed and working
- [x] `git log` shows 2 clean commits
- [x] `CLAUDE.md` exists and is comprehensive

---

## Phase 2: Next.js Project Scaffold

### Goal
Initialize the Next.js project with all dependencies installed and configured.

### Steps

#### Step 2.1: Initialize Next.js project
- Run `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm` with `--yes` flag or pipe `yes` to avoid prompts
- **IMPORTANT**: If create-next-app overwrites `.gitignore`, restore the entries from Step 1.2 (especially `data/` and `*.db`)
- **IMPORTANT**: Ensure Tailwind v3 is installed, NOT v4. If create-next-app installs v4, downgrade: `pnpm add -D tailwindcss@3 postcss autoprefixer` and ensure `tailwind.config.ts` exists
- Verify project runs with `pnpm dev` (start and kill quickly)
- Commit: `feat: initialize Next.js 15 project with TypeScript and Tailwind`

#### Step 2.2: Install core dependencies
- `pnpm add drizzle-orm better-sqlite3 swr`
- `pnpm add -D drizzle-kit @types/better-sqlite3 tsx`
- Commit: `chore: install drizzle, better-sqlite3, swr`

#### Step 2.3: Set up shadcn/ui
- Run `pnpm dlx shadcn@latest init --defaults` (use `--defaults` to avoid interactive prompts)
- If shadcn init prompts for style/config, use: default style, CSS variables for colors, `@/components` path
- Add components: `pnpm dlx shadcn@latest add button card checkbox progress dialog input label`
- Commit: `chore: set up shadcn/ui with base components`

#### Step 2.4: Create project directory structure
- Create directories (with `.gitkeep` where empty):
  - `src/db/` (database schema and config)
  - `src/db/migrations/` (Drizzle migrations)
  - `src/lib/` (utility functions)
  - `src/components/habits/` (habit-specific components)
  - `src/components/stats/` (score card components)
- Commit: `chore: create project directory structure`

### Success Criteria
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes
- [ ] All dependencies installed
- [ ] shadcn/ui components available
- [ ] Tailwind v3 confirmed (check `tailwind.config.ts` exists)

---

## Phase 3: Database Schema + Migrations + Seed

### Goal
Set up the Drizzle ORM schema, SQLite database, migrations, and seed data.

### Steps

#### Step 3.1: Create Drizzle config and schema
- Create `drizzle.config.ts` at project root:
  ```typescript
  import { defineConfig } from "drizzle-kit";

  export default defineConfig({
    dialect: "sqlite",
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations",
    dbCredentials: {
      url: "./data/habits.db",
    },
  });
  ```

- Create `src/db/schema.ts` with two tables (NOT three — `completed` column removed):

  **`habits` table:**
  | Column | Type | Description |
  |--------|------|-------------|
  | `id` | TEXT PK | UUID via `crypto.randomUUID()` |
  | `name` | TEXT NOT NULL | Habit display name |
  | `xp` | INTEGER NOT NULL | XP points awarded (default: 10) |
  | `active` | INTEGER NOT NULL | 1 = active, 0 = inactive (default: 1) |
  | `sort_order` | INTEGER NOT NULL | Display order |
  | `created_at` | TEXT NOT NULL | ISO timestamp |

  **`completions` table (simplified — no `completed` column):**
  | Column | Type | Description |
  |--------|------|-------------|
  | `id` | TEXT PK | UUID |
  | `habit_id` | TEXT NOT NULL | FK to `habits.id` |
  | `date` | TEXT NOT NULL | YYYY-MM-DD |

  Add a unique constraint on `(habit_id, date)` to prevent duplicates.

  **`settings` table:**
  | Column | Type | Description |
  |--------|------|-------------|
  | `key` | TEXT PK | Setting name |
  | `value` | TEXT NOT NULL | JSON-encoded value |

- Create `src/db/index.ts`:
  - Import `Database` from `better-sqlite3`
  - Import `drizzle` from `drizzle-orm/better-sqlite3`
  - Create `data/` directory if it doesn't exist (`mkdirSync` with `recursive: true`)
  - Initialize SQLite at `./data/habits.db`
  - Export drizzle instance

- Ensure `data/` is in `.gitignore`

- Add to `package.json` scripts:
  ```json
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:seed": "tsx src/db/seed.ts"
  ```

- Commit: `feat: add Drizzle schema for habits, completions, settings`

#### Step 3.2: Generate and apply migration
- Run `pnpm db:generate`
- Run `pnpm db:migrate`
- Verify tables exist (can use a quick script or just check the migration ran)
- Commit: `feat: generate and apply initial database migration`

#### Step 3.3: Create seed script
- Create `src/db/seed.ts` that inserts:
  - 5 example habits:
    1. Morning workout — 30 XP
    2. Read 30 minutes — 20 XP
    3. Meditate — 15 XP
    4. No junk food — 25 XP
    5. Code for 1 hour — 40 XP
  - Default setting: `include_weekends` = `"false"` (JSON string)
  - Sample completions: a few for today and yesterday so dashboard isn't empty
  - **Use today's actual date** via `new Date().toISOString().split('T')[0]` — never hardcode dates
  - Script should be idempotent: clear existing data before inserting (or check if data exists)
- Run `pnpm db:seed`
- Commit: `feat: add seed script with example habits`

### Success Criteria
- [ ] `pnpm db:generate` works
- [ ] `pnpm db:migrate` creates the SQLite file in `data/`
- [ ] `pnpm db:seed` populates data
- [ ] Database file is gitignored
- [ ] Schema has `completions` table WITHOUT `completed` column
- [ ] Unique constraint on `(habit_id, date)` in completions

---

## Phase 4: API Routes — Habits CRUD

### Goal
Build the `/api/habits` endpoints.

### Steps

#### Step 4.1: GET and POST /api/habits
- Create `src/app/api/habits/route.ts`:
  - **GET**: Return all active habits ordered by `sort_order`. Response: `{ habits: Habit[] }`
  - **POST**: Create a new habit. Body: `{ name: string, xp: number }`. Auto-generate UUID via `crypto.randomUUID()`, set `active=1`, set `sort_order` to `max(sort_order) + 1`, set `created_at` to `new Date().toISOString()`. Response: `{ habit: Habit }`
- Commit: `feat: add GET and POST /api/habits`

#### Step 4.2: PUT and DELETE /api/habits/[id]
- Create `src/app/api/habits/[id]/route.ts`:
  - **PUT**: Update habit fields (name, xp, active, sort_order). Only update fields that are provided. Response: `{ habit: Habit }`
  - **DELETE**: Soft-delete by setting `active=0`. Response: `{ success: true }`
- Commit: `feat: add PUT and DELETE /api/habits/[id]`

### Success Criteria
- [ ] GET /api/habits returns seeded habits
- [ ] POST creates a new habit
- [ ] PUT updates a habit
- [ ] DELETE soft-deletes (sets active=0)
- [ ] `pnpm build` passes

---

## Phase 5: API Routes — Completions

### Goal
Build the `/api/completions` endpoints.

### Steps

#### Step 5.1: GET and POST /api/completions
- Create `src/app/api/completions/route.ts`:
  - **GET** `?date=YYYY-MM-DD`: Return all completion records for that date. Response: `{ completions: Completion[] }` (each has `id`, `habit_id`, `date`)
  - **POST** `{ habit_id: string, date: string }`: Toggle completion:
    - If a row exists for (habit_id, date) → DELETE the row → return `{ completed: false }`
    - If no row exists → INSERT a new row → return `{ completed: true }`
- Commit: `feat: add GET and POST /api/completions`

### Success Criteria
- [ ] GET returns completions for a date
- [ ] POST creates a completion if none exists
- [ ] POST deletes the completion if one exists (toggle)
- [ ] `pnpm build` passes

---

## Phase 6: API Routes — Stats

### Goal
Build the `/api/stats` endpoint with daily, weekly, monthly XP and streak calculation.

### Steps

#### Step 6.1: Create scoring helper library
- Create `src/lib/scoring.ts` with these functions:

  **`calculateDailyScore(date: string)`**
  - Get all active habits where `created_at <= date` (per-day accurate tracking)
  - Sum their XP → `possible`
  - Get completions for that date, match against active habits → `earned`
  - Return `{ earned, possible, percentage }`

  **`calculateWeeklyScore(includeWeekends: boolean)`**
  - Determine week boundaries: Monday through today
  - If `!includeWeekends`: filter out Saturday (6) and Sunday (0)
  - For each day in range: call `calculateDailyScore(day)`
  - Sum earned and possible across days
  - Return `{ earned, possible, percentage }`

  **`calculateMonthlyScore()`**
  - From 1st of current month through today
  - For each day: call `calculateDailyScore(day)`
  - Sum earned and possible across days
  - Return `{ earned, possible, percentage }`

  **`calculateStreak(includeWeekends: boolean)`**
  - Start from today, walk backward day by day
  - Skip weekends if `!includeWeekends`
  - For each day, calculate `dailyScore`
  - If `percentage === 100` → increment streak count
  - If `percentage < 100` and it's today → skip today (check yesterday next)
  - If `percentage < 100` and it's NOT today → stop counting
  - Return streak count (number)
  - **Edge case**: if there are 0 active habits for a day, that day's percentage is 100% (nothing to do = perfect day) — OR skip that day. Decision: **skip days with 0 active habits** (don't inflate streak).

- Commit: `feat: add scoring helper library`

#### Step 6.2: Stats API endpoint
- Create `src/app/api/stats/route.ts`:
  - **GET**: Read `include_weekends` from settings table (default false if not set)
  - Call all four scoring functions
  - Response:
    ```json
    {
      "daily": { "earned": 45, "possible": 130, "percentage": 35 },
      "weekly": { "earned": 340, "possible": 650, "percentage": 52 },
      "monthly": { "earned": 1820, "possible": 2860, "percentage": 64 },
      "streak": 12
    }
    ```
- Commit: `feat: add /api/stats endpoint`

### Success Criteria
- [ ] GET /api/stats returns correct structure
- [ ] Daily score reflects today's completions
- [ ] Weekly score respects include_weekends setting
- [ ] Monthly score only counts up to today
- [ ] Per-day tracking: habits only count for days after their `created_at`
- [ ] Streak calculation works per DESIGN.md rules
- [ ] `pnpm build` passes

---

## Phase 7: API Routes — Settings

### Goal
Build the `/api/settings` endpoints.

### Steps

#### Step 7.1: Settings CRUD
- Create `src/app/api/settings/route.ts`:
  - **GET**: Return all settings as a key-value object. Response: `{ settings: { include_weekends: false } }`
  - **PUT**: Body: `{ key: string, value: any }`. Upsert the setting (insert or update on conflict). Response: `{ success: true }`
- Commit: `feat: add GET and PUT /api/settings`

### Success Criteria
- [ ] GET returns settings including include_weekends
- [ ] PUT upserts a setting
- [ ] `pnpm build` passes

---

## Phase 8: Dashboard Layout + Habit Checklist

### Goal
Build the main dashboard page with header, today panel, and habit checklist wired to the API.

### Steps

#### Step 8.1: SWR provider and API hooks
- Create `src/lib/api.ts` with SWR-based hooks:
  - `useHabits()` — fetches GET /api/habits, returns `{ habits, isLoading, error, mutate }`
  - `useCompletions(date: string)` — fetches GET /api/completions?date=, returns `{ completions, isLoading, error, mutate }`
  - `useStats()` — fetches GET /api/stats, returns `{ stats, isLoading, error, mutate }`
  - `useSettings()` — fetches GET /api/settings, returns `{ settings, isLoading, error, mutate }`
  - Generic fetcher function for SWR
- Create `src/components/providers.tsx` — SWR config provider (wrap in app layout)
- Update `src/app/layout.tsx` to include the SWR provider
- **Note**: `providers.tsx` must be a client component (`"use client"`)
- Commit: `feat: add SWR hooks and provider for API data`

#### Step 8.2: Dashboard layout and header
- Replace `src/app/page.tsx` with dashboard layout:
  - **Must be a client component** (uses hooks)
  - Header: "Gamified Habits" title + "Edit Habits" button (placeholder onClick for now)
  - Today panel: formatted date (e.g., "Fri, Feb 13")
  - Placeholder sections for checklist, progress bar, score cards
- Style with Tailwind, use shadcn Card components
- Commit: `feat: build dashboard layout with header and today panel`

#### Step 8.3: Habit checklist component
- Create `src/components/habits/habit-checklist.tsx`:
  - Client component
  - Uses `useHabits()` and `useCompletions(today)` hooks
  - Displays active habits with shadcn Checkbox and XP label
  - Clicking checkbox:
    1. Optimistic update: immediately toggle the UI
    2. Call POST /api/completions with `{ habit_id, date }`
    3. Revalidate both `useCompletions` and `useStats` via SWR mutate
  - Completed habits show with muted/strikethrough style
- Wire into dashboard page
- Commit: `feat: build habit checklist with toggle completions`

### Success Criteria
- [ ] Dashboard renders with header, date, and habit list
- [ ] Checkboxes toggle and persist to database
- [ ] Optimistic updates feel instant
- [ ] Stats revalidate when completion is toggled
- [ ] `pnpm build` passes

---

## Phase 9: Progress Bar + Score Cards

### Goal
Build the daily progress bar and weekly/monthly score cards.

### Steps

#### Step 9.1: Daily progress bar
- Create `src/components/stats/daily-progress.tsx`:
  - Shows "Day Progress" label
  - shadcn Progress component showing earned/possible XP
  - Text showing `"{earned}/{possible} XP ({percentage}%)"`
- Wire to `useStats()` hook
- Add to dashboard below checklist
- Commit: `feat: add daily progress bar`

#### Step 9.2: Weekly and monthly score cards
- Create `src/components/stats/weekly-card.tsx`:
  - shadcn Card showing weekly XP earned/possible and progress bar
  - Percentage text
  - "Include weekends" shadcn Checkbox
  - Toggling checkbox calls PUT /api/settings with `{ key: "include_weekends", value: "true"/"false" }`
  - After toggle, revalidate `useStats` and `useSettings`
- Create `src/components/stats/monthly-card.tsx`:
  - shadcn Card showing monthly XP earned/possible and progress bar
  - Shows current month name (e.g., "Feb 2026")
- Add both to dashboard in a 2-column grid (responsive: stacks on mobile)
- Commit: `feat: add weekly and monthly score cards`

### Success Criteria
- [ ] Progress bar updates when habits are checked
- [ ] Weekly card shows correct XP
- [ ] Weekend toggle updates stats
- [ ] Monthly card shows correct XP for current month
- [ ] `pnpm build` passes

---

## Phase 10: Streak + Celebrations

### Goal
Add streak counter display and celebration banners.

### Steps

#### Step 10.1: Streak counter
- Create `src/components/stats/streak-counter.tsx`:
  - Shows fire emoji + streak count + "days" label
  - Example: "🔥 12 days"
  - Uses `streak` from `useStats()` hook
- Add to today panel (next to the date)
- Commit: `feat: add streak counter display`

#### Step 10.2: Celebration banner
- Create `src/components/habits/celebration-banner.tsx`:
  - Dismissible banner with animation (slide-in or fade-in via Tailwind)
  - Checks conditions from DESIGN.md:
    - `daily.percentage === 100` → "Perfect day! +{daily.earned} XP earned"
    - `weekly.percentage === 100` → "Flawless week! Keep it up!"
    - `monthly.percentage === 100` → "Legendary month! Unstoppable!"
    - `streak` hits 7, 14, or 30 → "🔥 {n}-day streak!"
  - State managed locally with `useState` — dismissed banners don't persist
  - Multiple celebrations can stack (e.g., perfect day + streak milestone)
  - Celebrations should only trigger on **changes** (use `useRef` to track previous values and only show when a threshold is newly crossed)
- Wire to dashboard — render above checklist or below header
- Commit: `feat: add celebration banners with animations`

### Success Criteria
- [ ] Streak shows correct count
- [ ] Celebration banner appears when completing all daily habits
- [ ] Banner is dismissible
- [ ] Multiple celebrations can appear simultaneously
- [ ] `pnpm build` passes

---

## Phase 11: Habit Editor

### Goal
Build the "Edit Habits" modal/drawer for CRUD operations on habits.

### Steps

#### Step 11.1: Edit habits dialog
- Create `src/components/habits/habit-editor.tsx`:
  - Uses shadcn Dialog (modal)
  - Lists all habits (active ones first, inactive ones below with dimmed style)
  - Each habit row:
    - Name input (shadcn Input)
    - XP input (number, shadcn Input)
    - Active toggle (shadcn Checkbox)
    - Delete button (shadcn Button, variant: destructive)
  - "Add Habit" button at bottom with name + XP fields
  - Actions:
    - Edit → PUT /api/habits/[id]
    - Create → POST /api/habits
    - Delete → DELETE /api/habits/[id]
  - On close / save:
    - Revalidate all SWR hooks (habits, completions, stats)
- Wire "Edit Habits" button in header to open this dialog
- Commit: `feat: add habit editor dialog with CRUD`

### Success Criteria
- [ ] Can create new habits from the editor
- [ ] Can edit habit name and XP
- [ ] Can deactivate/reactivate habits
- [ ] Can delete habits (soft delete)
- [ ] Dashboard updates when editor is closed
- [ ] `pnpm build` passes

---

## Phase 12: Polish + Responsive

### Goal
Add loading states, error handling, responsive layout, and keyboard shortcuts.

### Steps

#### Step 12.1: Loading and error states
- Add loading skeletons for:
  - Habit checklist (3-4 skeleton rows)
  - Progress bar
  - Score cards
- Add error messages for failed API calls (simple text, not toast)
- Commit: `feat: add loading skeletons and error handling`

#### Step 12.2: Responsive layout
- Make dashboard responsive:
  - Max-width container centered on desktop
  - Single column on mobile (< 640px)
  - Score cards stack vertically on small screens
  - Touch-friendly checkbox sizes (min 44px tap target)
- Commit: `feat: make dashboard responsive for mobile`

#### Step 12.3: Keyboard shortcuts
- Add keyboard navigation to habit checklist:
  - Arrow Up/Down to move focus between habits
  - Space to toggle focused habit
  - Use `tabIndex` and `onKeyDown` handlers
- Commit: `feat: add keyboard shortcuts for habit navigation`

### Success Criteria
- [ ] Loading states show while data fetches
- [ ] Errors display gracefully
- [ ] Layout works on mobile viewports (test with browser dev tools)
- [ ] Keyboard shortcuts work
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes

---

## Implementation Notes for Agent

1. **Each step = one commit.** Do the work, verify it builds/lints, then commit.
2. **Always read CLAUDE.md first** at the start of a session.
3. **Run `pnpm build` and `pnpm lint` before every commit.** Fix all errors before committing.
4. **Use today's actual date** for seed data and testing — never hardcode dates.
5. **Use `@/` import alias** for all project imports.
6. **SQLite booleans are integers** (0/1), not true/false.
7. **The database file goes in `./data/habits.db`** — this directory must be gitignored.
8. **SWR mutate** should be used for optimistic updates when toggling completions. After toggling, revalidate BOTH completions and stats.
9. **Don't over-engineer.** Keep components simple. No Redux, no complex state management.
10. **shadcn/ui components are copied into the project** (not imported from a package). They live in `src/components/ui/`.
11. **Use `crypto.randomUUID()`** for UUID generation — no uuid package.
12. **Completions = row exists means done.** No `completed` boolean column. Toggle = insert or delete.
13. **Per-day scoring**: When calculating a day's possible XP, only count habits where `created_at <= that_day`. This prevents over-counting max XP for days before a habit existed.
14. **Tailwind v3**: If `create-next-app` installs Tailwind v4, downgrade immediately. Verify `tailwind.config.ts` exists (v4 uses CSS-only config).
15. **Non-interactive commands**: Always use flags like `--yes`, `--defaults` to avoid interactive prompts that block the agent.
16. **Streak edge case**: Days with 0 active habits are skipped (not counted as perfect or broken).

## Testing Strategy

### Manual Testing Steps (after each phase)
1. Start dev server: `pnpm dev`
2. Open `http://localhost:3000`
3. Verify the feature works as described in that phase's success criteria
4. Check browser console for errors

### API Testing (Phases 4-7)
- Use `curl` commands to test each endpoint after implementation
- Verify correct HTTP status codes and response shapes

### Edge Cases to Test (Phase 12)
- No habits created yet (empty state)
- First day of using the app (no history)
- Month boundary (last day of month → first day of next)
- All habits completed (celebrations should fire)
- Weekend behavior with toggle on/off
