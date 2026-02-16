"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Celebration = {
  id: string;
  message: string;
};

type StatsSnapshot = {
  dailyPct: number;
  weeklyPct: number;
  monthlyPct: number;
  streak: number;
};

const STREAK_MILESTONES = [7, 14, 30];

function detectCelebrations(
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

type CelebrationBannerProps = {
  stats: {
    daily: { earned: number; possible: number; percentage: number };
    weekly: { earned: number; possible: number; percentage: number };
    monthly: { earned: number; possible: number; percentage: number };
    streak: number;
  } | null;
};

export function CelebrationBanner({ stats }: CelebrationBannerProps) {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [prevSnapshot, setPrevSnapshot] = useState<StatsSnapshot | null>(null);

  useEffect(() => {
    if (!stats) return;

    const current: StatsSnapshot & { dailyEarned: number } = {
      dailyPct: stats.daily.percentage,
      weeklyPct: stats.weekly.percentage,
      monthlyPct: stats.monthly.percentage,
      streak: stats.streak,
      dailyEarned: stats.daily.earned,
    };

    if (prevSnapshot) {
      const newCelebrations = detectCelebrations(prevSnapshot, current);
      if (newCelebrations.length > 0) {
        setCelebrations((prev) => [...prev, ...newCelebrations]);
      }
    }

    setPrevSnapshot({
      dailyPct: current.dailyPct,
      weeklyPct: current.weeklyPct,
      monthlyPct: current.monthlyPct,
      streak: current.streak,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  function dismiss(id: string) {
    setCelebrations((prev) => prev.filter((c) => c.id !== id));
  }

  if (celebrations.length === 0) return null;

  return (
    <div className="space-y-2">
      {celebrations.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-lg border border-primary/30 bg-gradient-to-r from-primary/15 via-purple-500/10 to-pink-500/15 p-3"
        >
          <span className="font-medium text-sm text-primary">🎉 {c.message}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismiss(c.id)}
            className="h-6 px-2 text-xs"
          >
            ✕
          </Button>
        </div>
      ))}
    </div>
  );
}
