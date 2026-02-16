"use client";

import { useHabits, useCompletions, useStats } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";

function getToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function HabitChecklist() {
  const today = getToday();
  const { habits, isLoading: habitsLoading } = useHabits();
  const { completions, mutate: mutateCompletions } = useCompletions(today);
  const { mutate: mutateStats } = useStats();

  const completedHabitIds = new Set(
    completions.map((c: { habit_id: string }) => c.habit_id)
  );

  async function toggleHabit(habitId: string) {
    await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: habitId, date: today }),
    });

    mutateCompletions();
    mutateStats();
  }

  if (habitsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No habits yet. Click &quot;Edit Habits&quot; to add some.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {habits.map((habit: { id: string; name: string; xp: number }) => {
        const isCompleted = completedHabitIds.has(habit.id);
        return (
          <label
            key={habit.id}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent ${
              isCompleted ? "opacity-60" : ""
            }`}
          >
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => toggleHabit(habit.id)}
            />
            <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
              {habit.name}
            </span>
            <span className="ml-auto text-sm text-muted-foreground">
              +{habit.xp} XP
            </span>
          </label>
        );
      })}
    </div>
  );
}
