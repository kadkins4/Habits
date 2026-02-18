import type { habits, completions, antiHabitEntries } from "@/db/schema";

export type Habit = typeof habits.$inferSelect;

export type Completion = typeof completions.$inferSelect;

export type AntiHabitEntry = typeof antiHabitEntries.$inferSelect;

export type HabitStatus = "backlog" | "active" | "archived";

export type HabitDifficulty = "easy" | "medium" | "hard";

export type HabitType = "habit" | "antihabit";

const DIFFICULTY_XP: Record<HabitDifficulty, number> = { easy: 5, medium: 10, hard: 20 };

export function difficultyToXp(difficulty: HabitDifficulty): number {
  return DIFFICULTY_XP[difficulty];
}

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type Score = {
  earned: number;
  possible: number;
  percentage: number;
};

export type StatsSnapshot = {
  dailyPct: number;
  weeklyPct: number;
  monthlyPct: number;
  streak: number;
};

export type Celebration = {
  id: string;
  message: string;
};
