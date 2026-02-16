"use client";

import { useStats, useSettings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

export function WeeklyCard() {
  const { stats, isLoading: statsLoading, mutate: mutateStats } = useStats();
  const { settings, mutate: mutateSettings } = useSettings();

  const includeWeekends = settings.include_weekends === true;

  async function toggleWeekends() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "include_weekends",
        value: !includeWeekends,
      }),
    });
    mutateSettings();
    mutateStats();
  }

  if (statsLoading || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-20 rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const { earned, possible, percentage } = stats.weekly;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weekly Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {earned} / {possible} XP
        </div>
        <Progress value={percentage} />
        <div className="text-sm text-right text-muted-foreground">
          {percentage}%
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={includeWeekends}
            onCheckedChange={toggleWeekends}
          />
          Include weekends
        </label>
      </CardContent>
    </Card>
  );
}
