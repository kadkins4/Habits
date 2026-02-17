"use client";

import { useHabits, useCompletions } from "@/lib/api";
import type { Completion } from "@/lib/types";

type PendingBannerProps = {
  yesterdayDate: string;
  isYesterdayConfirmed: boolean;
};

export function PendingBanner({ yesterdayDate, isYesterdayConfirmed }: PendingBannerProps) {
  const { habits, isLoading: habitsLoading } = useHabits();
  const { completions, isLoading: completionsLoading } = useCompletions(yesterdayDate);

  if (isYesterdayConfirmed) return null;
  if (habitsLoading || completionsLoading) return null;

  const completedIds = new Set(completions.map((c: Completion) => c.habit_id));
  const pendingCount = habits.filter((h: { id: string }) => !completedIds.has(h.id)).length;

  if (pendingCount === 0) return null;

  return (
    <div className="text-sm px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground">
      {pendingCount} {pendingCount === 1 ? "item" : "items"} unconfirmed from yesterday
    </div>
  );
}
