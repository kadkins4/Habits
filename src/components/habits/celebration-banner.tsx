"use client";

import { useEffect, useRef, useState } from "react";
import { useStats } from "@/lib/api";
import { detectCelebrations } from "@/components/habits/utils";
import type { StatsSnapshot, Celebration } from "@/lib/types";

const AUTO_DISMISS_MS = 5000;

type Toast = Celebration & { exiting: boolean };

export function CelebrationBanner() {
  const { stats } = useStats();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevSnapshotRef = useRef<StatsSnapshot | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  function scheduleAutoDismiss(id: string) {
    const timer = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timersRef.current.delete(id);
      }, 300);
    }, AUTO_DISMISS_MS);
    timersRef.current.set(id, timer);
  }

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
        const newToasts = newCelebrations.map((c) => ({ ...c, exiting: false }));
        setToasts((prev) => [...prev, ...newToasts]);
        newToasts.forEach((t) => scheduleAutoDismiss(t.id));
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
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }

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
