"use client";

import type { KeyboardEvent } from "react";
import { useHabits, useCompletions, useStats } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/types";
import type { Habit, Completion } from "@/lib/types";

export function HabitChecklist() {
  const today = formatDate(new Date());
  const { habits, isLoading: habitsLoading, error: habitsError } = useHabits();
  const { completions, mutate: mutateCompletions } = useCompletions(today);
  const { mutate: mutateStats } = useStats();

  const completedHabitIds = new Set(
    completions.map((c: Completion) => c.habit_id)
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

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>, index: number) {
    const items = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
      "[data-habit-item]"
    );
    if (!items) return;

    if (e.key === "ArrowDown" && index < items.length - 1) {
      e.preventDefault();
      items[index + 1].focus();
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      items[index - 1].focus();
    } else if (e.key === " ") {
      e.preventDefault();
      const habit = habits[index];
      if (habit) toggleHabit(habit.id);
    }
  }

  if (habitsError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load habits. Please refresh.
      </p>
    );
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
    <div className="space-y-2" role="list">
      {habits.map((habit: Habit, index: number) => {
        const isCompleted = completedHabitIds.has(habit.id);
        return (
          <div
            key={habit.id}
            data-habit-item
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => toggleHabit(habit.id)}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${
              isCompleted ? "border-success/30 bg-success/5" : ""
            }`}
          >
            <Checkbox
              checked={isCompleted}
              onClick={(e) => {
                e.stopPropagation();
                toggleHabit(habit.id);
              }}
              tabIndex={-1}
            />
            <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
              {habit.name}
            </span>
            <span className="ml-auto text-sm font-medium text-xp">
              +{habit.xp} XP
            </span>
          </div>
        );
      })}
    </div>
  );
}
