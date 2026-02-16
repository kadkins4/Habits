# Feature Planning

Potential features to add to Gamified Habits, organized by impact.

## High Impact

### Leveling System
Add a user level based on total lifetime XP earned. Leveling up triggers a satisfying animation/sound. Gives a persistent sense of progression beyond daily streaks — even on a bad day, you never lose your level.

### Achievement Badges
Unlockable badges for milestones (first 7-day streak, 1000 XP earned, 30-day streak, completing all habits for a full month, etc.). Badges are a proven dopamine mechanic — they give you something to chase beyond the daily checklist.

### Heat Map Calendar
A GitHub-style contribution grid showing daily completion percentages over months. Makes historical data immediately visual. Seeing a wall of green squares is satisfying and motivates you not to "break the chain."

### Confetti / Sound Effects on Completion
Trigger confetti particles or a satisfying sound when you check off a habit, and a bigger celebration when you hit 100% for the day. Instant sensory reward is the simplest dopamine boost you can add.

### XP Multipliers for Streaks
Award bonus XP when you're on a streak (e.g., 1.5x after 7 days, 2x after 30 days). Creates a snowball effect that makes streaks feel increasingly valuable and makes breaking one feel more costly.

### Per-Habit Streaks
Show an individual streak counter next to each habit on the checklist — how many consecutive scheduled days you've completed that specific habit. Quickly reveals which habits you're crushing (20-day streak on meditation) and which ones you're struggling with (keeps resetting at 2 days for gym). This per-habit view complements the overall streak by giving actionable insight into where to focus, and seeing a long streak on a single habit makes it harder to skip "just this once."

### Personal Best Records
Track and display records — longest streak, highest single-day XP, most consecutive perfect weeks, etc. Once you set a record, you naturally want to beat it. Low-effort feature with high motivational payoff.

### Weekly Review Summary
An end-of-week summary showing your best day, worst day, total XP earned, streak status, and comparison to the previous week. Periodic reflection helps you course-correct, and the "vs. last week" comparison creates a competitive loop with yourself.

### Yesterday Mode
Allow users to go back exactly one day to check off habits they forgot to log. Only the previous day is editable — anything older stays locked. This removes the frustration of losing credit for habits you actually did but forgot to record before midnight, without opening the door to freely rewriting history.

### Add as Reminder (Apple Reminders / Calendar)
Provide an "Add as Reminder" or "Add to Calendar" option when creating or editing a habit. This would generate an Apple Reminders entry or calendar event (via `.ics` file download or deep-linking into the Reminders/Calendar apps on iOS and macOS). Helps bridge the gap between tracking habits and actually remembering to do them — the app becomes the source of truth while the OS handles the nudge.

## Medium Impact

### Weekly / Monthly Calendar View
A calendar view that shows each day color-coded by completion percentage — green for high completion, yellow for partial, red for poor. Configurable thresholds (e.g., green = 80%+, yellow = 40-79%, red = below 40%) let users set their own standards. Toggle between weekly and monthly views. Clicking a day expands to show which specific habits were completed. At a glance you can spot patterns like consistently red Fridays or a green streak that broke mid-month, making it far more actionable than raw numbers.

### Habit Frequency / Scheduling
Not every habit needs to be daily. When creating or editing a habit, users should be able to set a frequency: daily (default), specific days of the week (e.g., Mon/Wed/Fri), every other day, or weekly (N times per week). The habit only appears on the checklist when it's due, and scoring/streak calculations only count days where the habit was scheduled. This removes the guilt of seeing unchecked habits on off-days and makes progress tracking far more accurate for things like gym sessions, meal prep, or weekly reviews.

### Habit Difficulty Tiers
Let users tag habits as Easy / Medium / Hard with visual indicators. Harder habits could award more XP by default. Gives a sense of accomplishment for tackling the hard ones and helps with prioritization.

### Habit Categories / Tags
Group habits by category (health, productivity, learning, etc.) and show per-category stats. Helps you identify which areas of your life you're neglecting vs. crushing. Useful once you have 8+ habits.

### Rest Day / Vacation Mode
Pause streak tracking for a set number of days without losing your streak. Prevents the demoralizing "I lost my 60-day streak because I was sick" problem, which is one of the top reasons people abandon habit trackers.

### Habit Reordering (Drag and Drop)
Let users drag habits to reorder their checklist. People naturally want their most important or time-sensitive habits at the top. A `sort_order` column already exists in the schema — this just needs a UI. Small feature, but it makes the daily view feel intentional rather than arbitrary.

### Motivational Quotes / Daily Tip
Show a rotating motivational quote or habit-building tip at the top of the dashboard. Keeps the experience fresh each day and provides a small psychological nudge. Could pull from a curated local list or an API.

## Nice to Have

### Habit Notes / Journal
Optional short note per day or per habit completion ("Ran 3 miles today", "Only did 10 minutes of reading"). Adds context to historical data and turns the tracker into a lightweight journal.

### Dark/Light Theme Toggle
A polished toggle with smooth transitions. Small quality-of-life feature that makes the app feel more complete and personalized.

### Export Data (CSV / JSON)
Let users export their full completion history. People are more likely to invest in a system they can take data out of. Also useful for personal analytics in spreadsheets or other tools.

### PWA / Install to Home Screen
Make the app installable as a Progressive Web App so it feels native on phones and desktops. Adds an app icon, removes the browser chrome, and enables offline access. Critical if you share it with friends — nobody wants to bookmark a URL, but tapping an icon on their home screen feels like a real app.

### Habit Archive
Instead of deleting old habits, archive them so they stop appearing on the checklist but their historical data is preserved. Useful when a habit has served its purpose (e.g., "Take medication" after finishing a prescription) but you still want to see it in your history and stats.

### Time-of-Day Grouping
Tag habits as Morning, Afternoon, or Evening and group them accordingly on the checklist. Turns the daily view into a loose routine/schedule rather than a flat list. Helps you build a flow — knock out morning habits first, then afternoon, etc.

### Multi-User Support
Add basic authentication and per-user data isolation so friends can each have their own dashboard. Doesn't need to be complex — a simple login with username/password or magic link. Essential if you want to share the app without everyone editing the same habit list.

### Friend Leaderboard
Once multi-user is in place, add an opt-in leaderboard showing weekly/monthly XP rankings among friends. Friendly competition is one of the strongest motivation drivers — knowing your friend is ahead of you this week makes you want to check off that last habit.

### Streak Shield / Freeze
A consumable item (earned through achievements or long streaks) that protects your streak for one missed day. Adds a layer of strategy — do you use your shield now or save it? Gamifies the safety net itself, unlike vacation mode which is a blunt pause.
