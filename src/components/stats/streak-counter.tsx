"use client";

import { useStats } from "@/lib/api";

export function StreakCounter() {
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return null;
  }

  const streak = stats.streak;

  if (streak === 0) {
    return null;
  }

  return (
    <span className="text-sm font-medium text-streak">
      🔥 {streak} {streak === 1 ? "day" : "days"}
    </span>
  );
}
