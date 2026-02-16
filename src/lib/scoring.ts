import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { habits, completions } from "@/db/schema";

type Score = {
  earned: number;
  possible: number;
  percentage: number;
};

export function calculateDailyScore(date: string): Score {
  const activeHabits = db
    .select()
    .from(habits)
    .where(and(eq(habits.active, 1), lte(habits.created_at, date + "T23:59:59.999Z")))
    .all();

  if (activeHabits.length === 0) {
    return { earned: 0, possible: 0, percentage: 0 };
  }

  const dayCompletions = db
    .select()
    .from(completions)
    .where(eq(completions.date, date))
    .all();

  const completedHabitIds = new Set(dayCompletions.map((c) => c.habit_id));

  const possible = activeHabits.reduce((sum, h) => sum + h.xp, 0);
  const earned = activeHabits
    .filter((h) => completedHabitIds.has(h.id))
    .reduce((sum, h) => sum + h.xp, 0);

  const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  return { earned, possible, percentage };
}

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function getDaysInRange(start: Date, end: Date, includeWeekends: boolean): string[] {
  const days: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    if (includeWeekends || !isWeekend(current)) {
      days.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function calculateWeeklyScore(includeWeekends: boolean): Score {
  const today = new Date();
  const monday = getMonday(today);
  const days = getDaysInRange(monday, today, includeWeekends);

  let earned = 0;
  let possible = 0;

  for (const day of days) {
    const score = calculateDailyScore(day);
    earned += score.earned;
    possible += score.possible;
  }

  const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  return { earned, possible, percentage };
}

export function calculateMonthlyScore(): Score {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const days = getDaysInRange(firstOfMonth, today, true);

  let earned = 0;
  let possible = 0;

  for (const day of days) {
    const score = calculateDailyScore(day);
    earned += score.earned;
    possible += score.possible;
  }

  const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  return { earned, possible, percentage };
}

export function calculateStreak(includeWeekends: boolean): number {
  let streak = 0;
  const current = new Date();
  let isToday = true;

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(current);

    if (!includeWeekends && isWeekend(current)) {
      current.setDate(current.getDate() - 1);
      isToday = false;
      continue;
    }

    const score = calculateDailyScore(dateStr);

    // Skip days with 0 active habits
    if (score.possible === 0) {
      current.setDate(current.getDate() - 1);
      isToday = false;
      continue;
    }

    if (score.percentage === 100) {
      streak++;
    } else if (isToday) {
      // Today is incomplete — skip and check yesterday
    } else {
      break;
    }

    current.setDate(current.getDate() - 1);
    isToday = false;
  }

  return streak;
}
