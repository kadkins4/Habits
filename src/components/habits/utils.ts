import type { StatsSnapshot, Celebration } from "@/lib/types";

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
