import { TodayCard } from "@/components/habits/today-card";
import { WeeklyCard } from "@/components/stats/weekly-card";
import { MonthlyCard } from "@/components/stats/monthly-card";
import { CelebrationBanner } from "@/components/habits/celebration-banner";
import { HabitEditor } from "@/components/habits/habit-editor";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Gamified Habits</h1>
          <HabitEditor />
        </header>

        <CelebrationBanner />

        <TodayCard />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WeeklyCard />
          <MonthlyCard />
        </div>
      </div>
    </div>
  );
}
