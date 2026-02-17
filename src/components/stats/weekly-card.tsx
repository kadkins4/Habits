"use client";

import { useStats, useToggleWeekends } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StatCard } from "@/components/stats/stat-card";

export function WeeklyCard() {
  const { stats, isLoading: statsLoading } = useStats();
  const { includeWeekends, toggle: toggleWeekends } = useToggleWeekends();

  if (statsLoading || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-20 rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <StatCard title="Weekly Score" score={stats.weekly}>
      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <Checkbox
          checked={includeWeekends}
          onCheckedChange={toggleWeekends}
        />
        Include weekends
      </label>
    </StatCard>
  );
}
