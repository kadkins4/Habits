"use client";

import { useStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function getCurrentMonth(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function MonthlyCard() {
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-20 rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const { earned, possible, percentage } = stats.monthly;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm font-medium text-xp">
          {earned} / {possible} XP
        </div>
        <Progress value={percentage} />
        <div className="text-sm text-right text-muted-foreground">
          {percentage}% — {getCurrentMonth()}
        </div>
      </CardContent>
    </Card>
  );
}
