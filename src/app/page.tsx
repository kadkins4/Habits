import Link from "next/link";
import { TodayCard } from "@/components/habits/today-card";
import { WeeklyCard } from "@/components/stats/weekly-card";
import { MonthlyCard } from "@/components/stats/monthly-card";
import { CelebrationBanner } from "@/components/habits/celebration-banner";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Gamified Habits</h1>
          <Link
            href="/habits"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Manage Habits
          </Link>
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
