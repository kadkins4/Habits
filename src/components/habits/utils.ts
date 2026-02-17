import type { StatsSnapshot, Celebration, HabitStatus } from "@/lib/types";

export const COLUMN_CONFIG: readonly { status: HabitStatus; title: string }[] = [
  { status: "backlog", title: "Backlog" },
  { status: "active", title: "Active" },
  { status: "archived", title: "Archived" },
] as const;

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-red-500/20 text-red-400",
};

export const STREAK_MILESTONES = [7, 14, 30];

export function detectCelebrations(
  prev: StatsSnapshot,
  current: StatsSnapshot & { dailyEarned: number }
): Celebration[] {
  const celebrations: Celebration[] = [];

  if (current.dailyPct === 100 && prev.dailyPct < 100) {
    celebrations.push({
      id: "daily",
      message: `Perfect day! +${current.dailyEarned} XP earned`,
    });
  }

  if (current.weeklyPct === 100 && prev.weeklyPct < 100) {
    celebrations.push({
      id: "weekly",
      message: "Flawless week! Keep it up!",
    });
  }

  if (current.monthlyPct === 100 && prev.monthlyPct < 100) {
    celebrations.push({
      id: "monthly",
      message: "Legendary month! Unstoppable!",
    });
  }

  for (const milestone of STREAK_MILESTONES) {
    if (current.streak >= milestone && prev.streak < milestone) {
      celebrations.push({
        id: `streak-${milestone}`,
        message: `🔥 ${milestone}-day streak!`,
      });
    }
  }

  return celebrations;
}
