"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { DailyProgress } from "@/components/stats/daily-progress";
import { WeeklyCard } from "@/components/stats/weekly-card";
import { MonthlyCard } from "@/components/stats/monthly-card";
import { StreakCounter } from "@/components/stats/streak-counter";
import { CelebrationBanner } from "@/components/habits/celebration-banner";
import { HabitEditor } from "@/components/habits/habit-editor";
import { useStats } from "@/lib/api";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const { stats } = useStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Gamified Habits</h1>
          <HabitEditor />
        </header>

        <CelebrationBanner stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>TODAY — {formatDate()}</span>
              <StreakCounter />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <HabitChecklist />
            <DailyProgress />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WeeklyCard />
          <MonthlyCard />
        </div>
      </div>
    </div>
  );
}
