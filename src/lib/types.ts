import type { habits, completions } from "@/db/schema";

export type Habit = typeof habits.$inferSelect;

export type Completion = typeof completions.$inferSelect;

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
