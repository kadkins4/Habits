"use client";

import { useStats } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stats/stat-card";

export function WeeklyCard() {
  const { stats, isLoading: statsLoading } = useStats();

  if (statsLoading || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-20 rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return <StatCard title="Weekly Score" score={stats.weekly} />;
}
