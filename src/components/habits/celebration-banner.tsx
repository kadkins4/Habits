"use client";

import { useEffect, useRef } from "react";
import { useStats } from "@/lib/api";
import { detectCelebrations } from "@/components/habits/utils";
import { useToasts } from "@/lib/use-toasts";
import type { StatsSnapshot, Celebration } from "@/lib/types";

export function CelebrationBanner() {
  const { stats } = useStats();
  const { toasts, add, dismiss } = useToasts<Celebration>();
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
        add(newCelebrations);
      }
    }

    prevSnapshotRef.current = {
      dailyPct: current.dailyPct,
      weeklyPct: current.weeklyPct,
      monthlyPct: current.monthlyPct,
      streak: current.streak,
    };
  }, [stats, add]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center justify-between rounded-lg border border-primary/30 bg-gradient-to-r from-primary/15 via-purple-500/10 to-pink-500/15 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${
            t.exiting
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100 animate-in slide-in-from-bottom-4"
          }`}
        >
          <span className="font-medium text-sm text-primary">
            🎉 {t.message}
          </span>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-3 shrink-0 text-primary/60 hover:text-primary text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
