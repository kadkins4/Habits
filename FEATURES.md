# Features

Planned features for Gamified Habits organized by release milestone. Items move through: **Next** -> **In Progress** -> **Done**.

---

## Done

### Daily UX Shell: Date Toggle + Pending Banner

- Today/Yesterday toggle chip on the daily card
- Pending items banner with scroll-to-unchecked
- Date-aware stats API and progress bar

---

## In Progress

_(none yet)_

---

## Next

_(pick from the backlog below when ready)_

---

## MVP — Ship the Accountability-First Core

_Each epic should be shippable in 1-3 days. Focus: daily truth/accountability loop._

### Epic: Habit & Anti-Habit Checklist (Binary v1)

- Habits list with binary toggle (complete/incomplete)
- Anti-habits list with confirmation-based controls:
  - Status options: `unknown` | `avoided` | `slipped` (and later `auto_failed`)
- Temptation counter UI for anti-habits (`temptationCount`, info-only)

### Epic: Yesterday Mode (1-Day Grace)

- "Yesterday" opens a bottom sheet/modal with yesterday's full checklist
- Only yesterday is editable (hard rule)
- Confirm closes sheet and returns to TODAY

### Epic: Data Model (Minimal + Extensible)

- Habit daily entry: `completed: boolean` (default false)
- Anti-habit daily entry:
  - `status`: `"unknown"` | `"avoided"` | `"slipped"` | `"auto_failed"`
  - `temptationCount`: number (default 0)
- Anti-habit starts each day as `unknown` (not a win until confirmed)

### Epic: Day Boundary + Rollover Rules (Accountability System)

- Implement day boundary at 3:00am (today runs 3:00am to 2:59am)
- Habit rollover: if user never marks habit, stays `completed=false`
- Anti-habit rollover: new day starts as `unknown` (must confirm avoided/slipped)

### Epic: Auto-Fail (After 3 Days Unknown)

- On app launch/resume, run auto-fail check: if `status == unknown` and `days_since(date) >= 3` then `status = auto_failed`
- Show a single non-shaming message next app open if auto-fails occurred: "3 days ago (Friday) wasn't confirmed -- marked as a missed check-in for your anti-habits."
- (Optional in MVP) "Details" opens read-only view of affected days

### Epic: Simple Stats v0 (Just Enough Feedback)

- Anti-habit avoidance streak: increments on `avoided`, breaks on `slipped` or `auto_failed`
- Anti-habit success rate: `avoided` = success, `slipped` + `auto_failed` = failure, `unknown` excluded until it becomes `auto_failed`

---

## V1 — Polish + Motivation Layer

_Dopamine + polish without changing core truth/accountability rules._

### Epic: XP System (Foundation)

- Award XP for completing habits and avoiding anti-habits
- Define XP values (simple constants)
- End-of-day "Day Score" (XP earned today)

### Epic: Confetti / Sound Feedback

- Confetti/satisfying sound on habit completion
- Bigger celebration when 100% of scheduled items are confirmed for today

### Epic: Per-Habit Streaks

- Show streak counter next to each habit
- Streak logic respects "scheduled days" later; for now assume daily

### Epic: Personal Best Records

- Track records: longest streak (per habit and overall), highest single-day XP, most consecutive "perfect" days

### Epic: Quality-of-Life UX

- "Yesterday pending" badge: "Yesterday: X unconfirmed"
- Empty states and microcopy polish (non-shaming tone everywhere)

---

## V2 — Retention & Insight Features

_Badges, levels, heat map, weekly review._

### Epic: Achievement Badges

- Badge framework (`id`, `name`, `description`, `unlockedAt`)
- Milestone badges: first perfect day, first 7-day streak, 30-day streak, 1000 XP lifetime
- Badge unlock animation + badge cabinet screen

### Epic: Leveling System (Lifetime XP -> Level)

- Level calculation based on lifetime XP
- Level-up animation/sound
- Persist level + show in header/profile area

### Epic: Weekly Review Summary

- Weekly summary screen: best day / worst day, total XP, streak status, vs last week comparison
- Temptations trend insights: "temptations spiked Tue/Thu"

### Epic: Heat Map Calendar (GitHub-style)

- Contribution grid with daily completion percentage
- Tap day to show which habits were completed/confirmed

### Epic: Habit Reordering (Drag & Drop)

- Drag to reorder habits on TODAY list
- Persist `sort_order`

### Epic: Habit Archive

- Archive habit (removes from active checklist, keeps history)
- Archived list view + restore option

---

## V3 — Scheduling, Modes, Integrations

_Correctness & maturity: scheduling, difficulty tiers, integrations, modes._

### Epic: Habit Frequency / Scheduling

- Schedule options: daily, specific weekdays (Mon/Wed/Fri), every other day, N times per week
- Only show habits when due
- Streak/stats only count scheduled days

### Epic: Habit Difficulty Tiers

- Easy/Medium/Hard tag with visual indicator
- XP reward scales with difficulty

### Epic: Categories / Tags + Category Stats

- Add habit categories/tags (health, learning, etc.)
- Category-level stats + insights

### Epic: Rest Day / Vacation Mode

- Pause streak tracking for a chosen date range (no penalties)
- UI indicator + countdown until resume

### Epic: Notes / Journal

- Add daily note (or per-habit note)
- Display notes in day detail view and in weekly review context

### Epic: Export Data (CSV/JSON)

- Export full history
- Export filtered range (last 30/90/365 days)

### Epic: PWA / Installable

- PWA install prompt + app icon
- Offline support for today/yesterday logging

### Epic: Add as Reminder / Calendar

- "Add to Calendar / Reminders" on habit create/edit
- Generate `.ics` file download for calendar events

### Epic: Theme Toggle

- Dark/light mode toggle with smooth transitions

---

## V4 — Social + Competitive

_Only after the single-user loop feels addictive._

### Epic: Multi-User Support

- Authentication (simple: email magic link or username/password)
- Per-user data isolation

### Epic: Friend Leaderboard

- Opt-in leaderboard (weekly/monthly XP)
- Friend invites + privacy controls

### Epic: Streak Shield / Freeze

- Consumable shield protects streak for 1 missed day
- Earn shields via achievements or long streaks
- UI to use/hold shield (adds strategy)

---

## Game Layer Ideas

_Game-y mechanics that can be sprinkled into V2-V4 as optional epics._

### Epic: Quests (Daily / Weekly)

- Daily quest generator: "Complete 3 habits before noon", "Confirm all anti-habits today", "No slips today + <=2 temptations"
- Weekly quests: "7-day meditation streak", "Avoid gaming slip 5/7 days"
- Quest rewards: bonus XP, badges, cosmetic unlocks

### Epic: Boss Fights (Streak Milestones)

- Define "boss" as a streak gate (e.g., day 7, day 14, day 30)
- Boss has HP = number of required confirmations left in the milestone window
- Completing habits deals damage; slipping anti-habits heals boss slightly
- Victory grants a big reward (badge + multiplier for next week)

### Epic: Skill Tree (Meta Progression)

- Spend earned "Skill Points" on perks: +5% XP on mornings, 1 extra grace confirm per month, "temptation tracker" upgrades
- Visual tree UI (lightweight, satisfying)

### Epic: Cosmetics / Collectibles (Low-stakes Dopamine)

- Unlock themes, icons, avatar frames via levels/badges
- "Stickers" earned from perfect days

### Epic: Mini-Games (Ultra Optional)

- 10-second "loot roll" animation when you hit 100% day completion
- Daily chest that opens only after confirmations are done

---

## Idea Vault (Experimental / Maybe Don't Ship)

_Not bad ideas -- just higher risk, more complexity, or might distract from the simplicity/accountability vibe._

### Real-time Notifications for Pending Confirmations
Can feel naggy. Proceed with caution.

### Full Backfill Editing Beyond Yesterday
Invites history-rewriting. Conflicts with accountability model.

### Punitive Mechanics ("Lose XP", "You Failed")
Conflicts with non-shaming tone.

### Heavy Social Pressure Mechanics
Public streak sharing by default is too aggressive.

### Complex Economies (Gold/Items/Shops) Too Early
Can bloat the product before core loop is solid.
