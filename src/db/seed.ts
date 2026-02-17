import { mkdirSync } from "fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { habits, completions, settings } from "./schema";

mkdirSync("./data", { recursive: true });

const sqlite = new Database("./data/habits.db");
const db = drizzle(sqlite);

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Clear existing data
db.delete(completions).run();
db.delete(habits).run();
db.delete(settings).run();

// Habits created at different times to simulate organic growth
const seedHabits = [
  { id: crypto.randomUUID(), name: "Morning workout",  xp: 30, active: 1, sort_order: 1, created_at: daysAgo(60).toISOString() },
  { id: crypto.randomUUID(), name: "Read 30 minutes",  xp: 20, active: 1, sort_order: 2, created_at: daysAgo(60).toISOString() },
  { id: crypto.randomUUID(), name: "Meditate",         xp: 15, active: 1, sort_order: 3, created_at: daysAgo(45).toISOString() },
  { id: crypto.randomUUID(), name: "No junk food",     xp: 25, active: 1, sort_order: 4, created_at: daysAgo(30).toISOString() },
  { id: crypto.randomUUID(), name: "Code for 1 hour",  xp: 40, active: 1, sort_order: 5, created_at: daysAgo(21).toISOString() },
  { id: crypto.randomUUID(), name: "Journal",          xp: 10, active: 1, sort_order: 6, created_at: daysAgo(14).toISOString() },
  { id: crypto.randomUUID(), name: "Drink 8 glasses",  xp: 10, active: 0, sort_order: 7, created_at: daysAgo(55).toISOString() },
];

for (const habit of seedHabits) {
  db.insert(habits).values(habit).run();
}

// Completion probability per habit — gives each habit a distinct "personality"
// Higher = more consistently completed
const completionRates: Record<string, number> = {
  "Morning workout":  0.7,
  "Read 30 minutes":  0.8,
  "Meditate":         0.6,
  "No junk food":     0.75,
  "Code for 1 hour":  0.65,
  "Journal":          0.5,
  "Drink 8 glasses":  0.4,
};

// Seeded random for reproducibility
let rngState = 42;
function seededRandom(): number {
  rngState = (rngState * 1664525 + 1013904223) & 0x7fffffff;
  return rngState / 0x7fffffff;
}

let completionCount = 0;

// Generate completions for past 60 days (skip today so user can interact)
for (let daysBack = 1; daysBack <= 60; daysBack++) {
  const date = daysAgo(daysBack);
  const dateStr = formatLocalDate(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  for (const habit of seedHabits) {
    const habitCreated = new Date(habit.created_at);
    // Only generate completions after the habit was created
    if (date < habitCreated) continue;
    // Skip inactive habit after it was "archived" (only active first 40 days)
    if (habit.active === 0 && daysBack < 15) continue;

    const baseRate = completionRates[habit.name] ?? 0.5;
    // Slightly lower completion on weekends
    const rate = isWeekend ? baseRate * 0.85 : baseRate;

    // Create a recent streak for "Read 30 minutes" (last 8 days)
    if (habit.name === "Read 30 minutes" && daysBack <= 8) {
      db.insert(completions).values({
        id: crypto.randomUUID(),
        habit_id: habit.id,
        date: dateStr,
      }).run();
      completionCount++;
      continue;
    }

    // Create a broken streak for "Morning workout" (missed yesterday)
    if (habit.name === "Morning workout" && daysBack === 1) {
      continue; // skip yesterday — streak broken
    }

    if (seededRandom() < rate) {
      db.insert(completions).values({
        id: crypto.randomUUID(),
        habit_id: habit.id,
        date: dateStr,
      }).run();
      completionCount++;
    }
  }
}

// Seed default settings
db.insert(settings).values({ key: "include_weekends", value: "false" }).run();

const today = formatLocalDate(new Date());
console.log("Seeded database successfully:");
console.log(`  - ${seedHabits.length} habits (1 inactive/archived)`);
console.log(`  - ${completionCount} completions across 60 days`);
console.log(`  - 1 setting (include_weekends: false)`);
console.log(`  - Date range: ${formatLocalDate(daysAgo(60))} to ${formatLocalDate(daysAgo(1))}`);
console.log(`  - Today (${today}) left empty for interactive testing`);
