"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { detectCelebrations } from "@/components/habits/utils";
import type { StatsSnapshot, Celebration } from "@/lib/types";

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
  const prevSnapshotRef = useRef<StatsSnapshot | null>(null);

  useEffect(() => {
    if (!stats) return;

    const current: StatsSnapshot & { dailyEarned: number } = {
      dailyPct: stats.daily.percentage,
      weeklyPct: stats.weekly.percentage,
      monthlyPct: stats.monthly.percentage,
      streak: stats.streak,
      dailyEarned: stats.daily.earned,
    };

    if (prevSnapshotRef.current) {
      const newCelebrations = detectCelebrations(prevSnapshotRef.current, current);
      if (newCelebrations.length > 0) {
        setCelebrations((prev) => [...prev, ...newCelebrations]);
      }
    }

    prevSnapshotRef.current = {
      dailyPct: current.dailyPct,
      weeklyPct: current.weeklyPct,
      monthlyPct: current.monthlyPct,
      streak: current.streak,
    };
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
