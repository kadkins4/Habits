"use client";

import { useStats } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stats/stat-card";

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

  return (
    <StatCard title="Monthly Score" score={stats.monthly} subtitle={getCurrentMonth()} />
  );
}
