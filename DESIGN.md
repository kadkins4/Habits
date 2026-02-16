# Gamified Habits — Dashboard Design

## Tech Stack

| Layer      | Choice                        | Why                                      |
|------------|-------------------------------|------------------------------------------|
| Framework  | Next.js 14 (App Router)       | Full-stack React, API routes built in    |
| Database   | SQLite via Drizzle ORM        | Zero config, single file, fast           |
| Styling    | Tailwind CSS + shadcn/ui      | Clean components, easy to customize      |
| Language   | TypeScript                    | Type safety across frontend and backend  |
| State      | React hooks + SWR             | Simple data fetching with cache          |

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  HEADER: "Gamified Habits"          [Edit Habits]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TODAY — Fri, Feb 13          Streak: 🔥 12 days    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ☐ Morning workout           +30 XP          │    │
│  │ ☑ Read 30 minutes           +20 XP          │    │
│  │ ☐ Meditate                  +15 XP          │    │
│  │ ☑ No junk food              +25 XP          │    │
│  │ ☐ Code for 1 hour           +40 XP          │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Day Progress  ████████░░░░░░░░░░░  45/130 XP (35%)│
│                                                     │
│  ┌──────────────────┐  ┌──────────────────────┐     │
│  │ WEEKLY SCORE     │  │ MONTHLY SCORE        │     │
│  │ 340 / 650 XP     │  │ 1,820 / 2,860 XP    │     │
│  │ ████████░░░ 52%  │  │ ██████░░░░░░░ 64%   │     │
│  │                  │  │                      │     │
│  │ [x] Include      │  │ Feb 2026             │     │
│  │     weekends     │  │                      │     │
│  └──────────────────┘  └──────────────────────┘     │
│                                                     │
│  🎉 CELEBRATION BANNER (when milestones hit)        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Sections

1. **Header** — App name + "Edit Habits" button (opens modal/drawer)
2. **Today Panel** — Date, streak counter, habit checklist with XP values
3. **Day Progress Bar** — XP earned today / total possible XP today
4. **Weekly Score Card** — XP earned this week / total possible, with weekend toggle
5. **Monthly Score Card** — XP earned this month / total possible
6. **Celebration Banner** — Animated message when day/week/month is 100%

---

## Data Model

### `habits` table

| Column       | Type     | Description                              |
|--------------|----------|------------------------------------------|
| `id`         | TEXT PK  | UUID                                     |
| `name`       | TEXT     | Habit display name                       |
| `xp`         | INTEGER  | XP points awarded on completion          |
| `active`     | BOOLEAN  | Whether it shows in today's checklist    |
| `sort_order` | INTEGER  | Display order in the checklist           |
| `created_at` | TEXT     | ISO timestamp                            |

### `completions` table

| Column     | Type     | Description                                |
|------------|----------|--------------------------------------------|
| `id`       | TEXT PK  | UUID                                       |
| `habit_id` | TEXT FK  | References `habits.id`                     |
| `date`     | TEXT     | ISO date string (YYYY-MM-DD)               |
| `completed`| BOOLEAN  | Whether the habit was done that day         |

### `settings` table

| Column  | Type    | Description                              |
|---------|---------|------------------------------------------|
| `key`   | TEXT PK | Setting name                             |
| `value` | TEXT    | JSON-encoded value                       |

Settings stored:
- `include_weekends` — boolean, default `false`

---

## Scoring Logic

### XP System

- Each habit has a configurable XP value (default: 10)
- Completing a habit on a given day awards its full XP
- No partial credit — binary complete/incomplete

### Daily Score

```
daily_xp = sum of XP for all completed active habits today
daily_max = sum of XP for all active habits
daily_pct = daily_xp / daily_max * 100
```

### Weekly Score

```
week = Monday through Friday (default)
if include_weekends: week = Monday through Sunday

weekly_xp = sum of daily_xp for each day in the current week
weekly_max = daily_max * number_of_days_in_week_scope
weekly_pct = weekly_xp / weekly_max * 100
```

Only counts days up to and including today (don't penalize for future days).

### Monthly Score

```
monthly_xp = sum of daily_xp for each day in the current month (up to today)
monthly_max = daily_max * days_elapsed_in_month
monthly_pct = monthly_xp / monthly_max * 100
```

Same rule: only counts days up to today.

### Streak Rules

A **streak** is the number of consecutive days where `daily_pct == 100%`.

- Streak counts backward from today (or yesterday if today isn't complete yet)
- If today is 100% complete, today is included in the streak
- If today is incomplete but yesterday was 100%, streak shows yesterday's count
- If today is incomplete and yesterday was also incomplete, streak = 0
- Weekends: if `include_weekends` is off, Sat/Sun are skipped (don't break streak)

### Celebrations

Trigger a celebration banner when:

| Event              | Condition              | Message                          |
|--------------------|------------------------|----------------------------------|
| Day complete       | daily_pct == 100       | "Perfect day! +{xp} XP earned"  |
| Week complete      | weekly_pct == 100      | "Flawless week! Keep it up!"     |
| Month complete     | monthly_pct == 100     | "Legendary month! Unstoppable!"  |
| Streak milestone   | streak hits 7, 14, 30  | "🔥 {n}-day streak!"             |

Celebrations are dismissible and don't persist.

---

## API Routes

| Method | Route                    | Purpose                          |
|--------|--------------------------|----------------------------------|
| GET    | `/api/habits`            | List all active habits           |
| POST   | `/api/habits`            | Create a new habit               |
| PUT    | `/api/habits/[id]`       | Update habit name, XP, active    |
| DELETE | `/api/habits/[id]`       | Soft-delete (set active=false)   |
| GET    | `/api/completions?date=` | Get completions for a date       |
| POST   | `/api/completions`       | Toggle a habit completion        |
| GET    | `/api/stats?range=`      | Get weekly/monthly/streak stats  |
| GET    | `/api/settings`          | Get settings                     |
| PUT    | `/api/settings`          | Update settings                  |

---

## Build Plan

### Phase 1: Project Setup

1. Initialize Next.js 14 project with TypeScript and Tailwind
2. Install dependencies: `drizzle-orm`, `better-sqlite3`, `shadcn/ui`, `swr`
3. Set up Drizzle schema and SQLite database file
4. Run initial migration to create tables
5. Seed with 3–5 example habits

### Phase 2: Backend API

6. Build `/api/habits` CRUD routes
7. Build `/api/completions` routes (get by date, toggle)
8. Build `/api/stats` route (daily/weekly/monthly XP, streak)
9. Build `/api/settings` routes

### Phase 3: Core Dashboard UI

10. Build the main dashboard page layout (header, sections)
11. Build the habit checklist component (checkboxes + XP labels)
12. Wire checkboxes to the completions API (optimistic updates via SWR)
13. Build the daily progress bar component
14. Build weekly and monthly score cards
15. Add the weekend toggle to weekly score card

### Phase 4: Streak & Celebrations

16. Implement streak calculation logic in the stats API
17. Build the streak counter display
18. Build the celebration banner component with animations
19. Wire celebrations to trigger on score changes

### Phase 5: Habit Editor

20. Build the "Edit Habits" modal/drawer
21. Add form for creating new habits (name + XP)
22. Add inline editing for existing habits (name, XP, reorder)
23. Add delete/deactivate button per habit

### Phase 6: Polish

24. Add loading states and error handling
25. Make responsive for mobile
26. Add keyboard shortcuts (space to toggle focused habit)
27. Test edge cases (no habits, first day, month boundaries)
