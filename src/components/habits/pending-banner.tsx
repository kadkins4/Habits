"use client";

import { useHabits, useCompletions } from "@/lib/api";
import type { Completion } from "@/lib/types";

type PendingBannerProps = {
  yesterdayDate: string;
  isYesterdayConfirmed: boolean;
  onOpen: () => void;
};

export function PendingBanner({ yesterdayDate, isYesterdayConfirmed, onOpen }: PendingBannerProps) {
  const { habits, isLoading: habitsLoading } = useHabits();
  const { completions, isLoading: completionsLoading } = useCompletions(yesterdayDate);

  if (isYesterdayConfirmed) return null;
  if (habitsLoading || completionsLoading) return null;

  const completedIds = new Set(completions.map((c: Completion) => c.habit_id));
  const pendingCount = habits.filter((h: { id: string }) => !completedIds.has(h.id)).length;

  if (pendingCount === 0) return null;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left text-sm px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
    >
      {pendingCount} {pendingCount === 1 ? "item" : "items"} unconfirmed from yesterday
    </button>
  );
}
