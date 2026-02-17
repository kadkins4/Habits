# Gamified Habits

A gamified habit-tracking dashboard that lets users define daily habits with XP values, check them off, and track progress through daily/weekly/monthly score cards with streaks and celebration banners.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Database | SQLite via Drizzle ORM + better-sqlite3 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Language | TypeScript (strict mode) |
| State/Fetching | SWR |
| Package Manager | pnpm |
| Node.js | 22 LTS |

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages + API routes
│   ├── api/
│   │   ├── habits/       # Habit CRUD
│   │   ├── completions/  # Completion toggle
│   │   ├── stats/        # Daily/weekly/monthly/streak stats
│   │   └── settings/     # App settings
│   ├── layout.tsx
│   └── page.tsx          # Main dashboard
├── components/
│   ├── ui/               # shadcn/ui components (auto-generated)
│   ├── habits/           # Habit-specific components
│   └── stats/            # Score card components
├── db/
│   ├── schema.ts         # Drizzle schema
│   ├── index.ts          # Database connection
│   ├── seed.ts           # Seed script
│   └── migrations/       # Drizzle migrations
└── lib/
    ├── api.ts            # SWR hooks
    └── scoring.ts        # XP/streak calculation helpers
```

## Code Style

- Always use TypeScript strict mode
- Use `type` over `interface` unless extending
- Use named exports, not default exports
- Use absolute imports via `@/` alias
- Prefer `async/await` over `.then()`
- Use Drizzle query builder, never raw SQL
- SQLite booleans are integers (0/1), not true/false
- Use `crypto.randomUUID()` for UUID generation (no uuid package)

## Commit Rules

- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Each commit should be atomic and buildable
- Commit messages should be simple and short. No co-author and try to keep to one line
- Always run `pnpm lint` before committing — fix any errors
- Always run `pnpm build` before committing — fix any errors

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed example data |

## Key Implementation Details

- **Completions**: Row exists = habit done. No `completed` boolean. Toggle = insert or delete.
- **Scoring**: Per-day tracking — habits only count toward days after their `created_at`.
- **Streak**: Days with 0 active habits are skipped (not counted as perfect or broken).
- **Database file**: `./data/habits.db` (gitignored).
- **shadcn/ui**: Components copied into `src/components/ui/` (not a package import).

## Project Tracking

We use two markdown files to track work. Both follow the same pattern: items are organized under status headers and move forward as work progresses. No numbered lists — use `###` headings for each item.

| File | Purpose | Flow |
|------|---------|------|
| `BUGS.md` | Known bugs with root cause analysis | **Next** -> **Done** |
| `FEATURES.md` | Planned features by impact tier | **Next** -> **In Progress** -> **Done** |

- When starting a bug or feature, move its heading under the appropriate status section.
- When finishing, remove the item from the list entirely and add just the `###` heading under **Done** (no description). Keep the list clean — no strikethroughs.
- New bugs go under **Next** with a priority prefix and a root cause description and affected files.
- Bug priorities: **P1** (blocking / broken core functionality), **P2** (degraded experience), **P3** (minor annoyance).
- New features go into the appropriate **Backlog** tier (High / Medium / Nice to Have) unless they're immediately next up.

**IMPORTANT**
## AI-Specific Rules

### ESLint Rules
- Use `import type { Foo }` for type-only imports (enforced by `consistent-type-imports`)
- Import from namespace files, not internal component paths

### General
- Favor simple solutions over complex ones.
- When the user states a new coding preference or process change, ask if it should be added to `CLAUDE.md` before making the update.
- When making changes, ask if we should commit those changes. Or if you are starting a new task and there are uncommitted changes, ask if those should be committed prior.

### Components & Architecture
- Default to Server Components. Only add `'use client'` when client-side interactivity or hooks are needed.
- Components should be dumb. Break complex components into smaller reusable components or offload logic to custom hooks.
- Avoid nested if statements. Prefer ternaries or early returns; if logic gets too complicated, extract to a helper function.

### File Organization
- No barrel files (`index.ts` that re-exports). Import directly from the source file.
- If a component has more than one type, helper method, or constant, move those to their own respective file in that directory (types -> `types.ts`, helpers and constants -> `utils.ts`)
- Use absolute imports in TSX files (`@components/…`, no `./` or `../`)

### Testing
- Do NOT test implementation details—only functionality that affects the end user.
- Prefer `getByRole`/`getByText` over `getByTestId` where possible.

### Code Style Guide
- **No nested ternaries.** Keep ternaries simple and readable. If logic requires nesting, extract to a helper function or use early returns.
- Prefer explicit ternaries over short-circuit evaluation for conditional rendering:
  ```tsx
  // Good
  {condition ? <Component /> : null}

  // Bad
  {!!condition && <Component />}
  ```
