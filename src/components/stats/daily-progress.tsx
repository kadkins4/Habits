"use client";

import { useDailyStats } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { XpDelta } from "@/components/stats/xp-delta";

type DailyProgressProps = {
  date: string;
};

export function DailyProgress({ date }: DailyProgressProps) {
  const { daily, isLoading, error } = useDailyStats(date);

  if (error) return null;
  if (isLoading || !daily) {
    return <div className="h-12 rounded bg-muted animate-pulse" />;
  }

  const { earned, possible, percentage } = daily;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Day Progress</span>
        <span className="text-xp font-medium">
          {earned}/{possible} XP ({percentage}%)
          <XpDelta earned={earned} />
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
