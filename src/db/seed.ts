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

const today = formatLocalDate(new Date());
const yesterday = formatLocalDate(new Date(Date.now() - 86400000));
const now = new Date().toISOString();

// Clear existing data
db.delete(completions).run();
db.delete(habits).run();
db.delete(settings).run();

// Seed habits
const seedHabits = [
  { id: crypto.randomUUID(), name: "Morning workout", xp: 30, active: 1, sort_order: 1, created_at: now },
  { id: crypto.randomUUID(), name: "Read 30 minutes", xp: 20, active: 1, sort_order: 2, created_at: now },
  { id: crypto.randomUUID(), name: "Meditate", xp: 15, active: 1, sort_order: 3, created_at: now },
  { id: crypto.randomUUID(), name: "No junk food", xp: 25, active: 1, sort_order: 4, created_at: now },
  { id: crypto.randomUUID(), name: "Code for 1 hour", xp: 40, active: 1, sort_order: 5, created_at: now },
];

for (const habit of seedHabits) {
  db.insert(habits).values(habit).run();
}

// Seed some completions for today and yesterday
const sampleCompletions = [
  { id: crypto.randomUUID(), habit_id: seedHabits[1].id, date: today },
  { id: crypto.randomUUID(), habit_id: seedHabits[3].id, date: today },
  { id: crypto.randomUUID(), habit_id: seedHabits[0].id, date: yesterday },
  { id: crypto.randomUUID(), habit_id: seedHabits[1].id, date: yesterday },
  { id: crypto.randomUUID(), habit_id: seedHabits[2].id, date: yesterday },
];

for (const completion of sampleCompletions) {
  db.insert(completions).values(completion).run();
}

// Seed default settings
db.insert(settings).values({ key: "include_weekends", value: "false" }).run();

console.log("Seeded database successfully:");
console.log(`  - ${seedHabits.length} habits`);
console.log(`  - ${sampleCompletions.length} completions`);
console.log(`  - 1 setting (include_weekends: false)`);
console.log(`  - Today: ${today}, Yesterday: ${yesterday}`);

sqlite.close();
