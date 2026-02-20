"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { DailyProgress } from "@/components/stats/daily-progress";
import { StreakCounter } from "@/components/stats/streak-counter";
import { PendingBanner } from "@/components/habits/pending-banner";
import { YesterdayDrawer } from "@/components/habits/yesterday-drawer";
import { useYesterday } from "@/lib/use-yesterday";
import { formatDate } from "@/lib/types";

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function TodayCard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    yesterdayDate,
    yesterdayDisplayDate,
    isYesterdayConfirmed,
    confirmYesterday,
  } = useYesterday();

  const today = formatDate(new Date());
  const todayDisplay = formatDisplayDate(new Date());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              TODAY — {todayDisplay}
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-xs font-medium px-2.5 py-1 rounded-full border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Yesterday
              </button>
            </span>
            <StreakCounter />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PendingBanner
            yesterdayDate={yesterdayDate}
            isYesterdayConfirmed={isYesterdayConfirmed}
            onOpen={() => setDrawerOpen(true)}
          />
          <HabitChecklist date={today} />
          <DailyProgress date={today} />
        </CardContent>
      </Card>

      <YesterdayDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        yesterdayDate={yesterdayDate}
        displayDate={yesterdayDisplayDate}
        isConfirmed={isYesterdayConfirmed}
        onConfirm={confirmYesterday}
      />
    </>
  );
}
