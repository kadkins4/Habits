"use client";

import { useStats } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

export function DailyProgress() {
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return <div className="h-12 rounded bg-muted animate-pulse" />;
  }

  const { earned, possible, percentage } = stats.daily;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Day Progress</span>
        <span className="text-muted-foreground">
          {earned}/{possible} XP ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
