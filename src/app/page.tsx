"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitChecklist } from "@/components/habits/habit-checklist";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Gamified Habits</h1>
          <Button variant="outline">Edit Habits</Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>TODAY — {formatDate()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HabitChecklist />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
