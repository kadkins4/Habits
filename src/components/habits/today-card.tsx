"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { DailyProgress } from "@/components/stats/daily-progress";
import { StreakCounter } from "@/components/stats/streak-counter";
import { DateToggle } from "@/components/habits/date-toggle";
import { PendingBanner } from "@/components/habits/pending-banner";
import { ConfirmYesterdayButton } from "@/components/habits/confirm-yesterday-button";
import { useDateToggle } from "@/lib/use-date-toggle";

export function TodayCard() {
  const {
    view,
    setView,
    date,
    displayDate,
    isYesterday,
    yesterdayDate,
    isYesterdayConfirmed,
    confirmYesterday,
  } = useDateToggle();

  const label = isYesterday ? "YESTERDAY" : "TODAY";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {label} — {displayDate}
            <DateToggle view={view} onToggle={setView} />
          </span>
          <StreakCounter />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isYesterday ? (
          <PendingBanner
            yesterdayDate={yesterdayDate}
            isYesterdayConfirmed={isYesterdayConfirmed}
          />
        ) : null}
        <HabitChecklist date={date} isYesterday={isYesterday} />
        <DailyProgress date={date} />
        {isYesterday ? (
          <ConfirmYesterdayButton
            isConfirmed={isYesterdayConfirmed}
            onConfirm={confirmYesterday}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
