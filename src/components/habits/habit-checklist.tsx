"use client";

import type { KeyboardEvent } from "react";
import { useHabits, useCompletions, useStats, useDailyStats, useAntiHabitEntries } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { difficultyToXp } from "@/lib/types";
import type { Habit, Completion, HabitDifficulty, AntiHabitEntry } from "@/lib/types";
import { AntiHabitItem } from "@/components/habits/anti-habit-item";

type HabitChecklistProps = {
  date: string;
  isYesterday?: boolean;
};

export function HabitChecklist({ date, isYesterday = false }: HabitChecklistProps) {
  const { habits, isLoading: habitsLoading, error: habitsError } = useHabits();
  const { completions, mutate: mutateCompletions } = useCompletions(date);
  const { entries, mutate: mutateEntries } = useAntiHabitEntries(date);
  const { mutate: mutateStats } = useStats();
  const { mutate: mutateDailyStats } = useDailyStats(date);

  const completedHabitIds = new Set(
    completions.map((c: Completion) => c.habit_id)
  );

  const regularHabits = habits.filter((h: Habit) => h.type === "habit");
  const antiHabits = habits.filter((h: Habit) => h.type === "antihabit");

  const entryMap = new Map<string, AntiHabitEntry>(
    entries.map((e: AntiHabitEntry) => [e.habit_id, e])
  );

  async function toggleHabit(habitId: string) {
    await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: habitId, date }),
    });

    mutateCompletions();
    mutateStats();
    mutateDailyStats();
  }

  async function postAntiHabitAction(habitId: string, action: "toggle" | "increment" | "decrement") {
    await fetch("/api/anti-habit-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date, action }),
    });
    mutateEntries();
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
      const habit = regularHabits[index];
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
        No habits yet. Click &quot;Manage Habits&quot; to add some.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Habits
        </p>
        {regularHabits.length === 0 ? (
          <p className="text-muted-foreground text-sm">No habits yet.</p>
        ) : (
          <div className="space-y-2" role="list">
            {regularHabits.map((habit: Habit, index: number) => {
              const isCompleted = completedHabitIds.has(habit.id);
              return (
                <div
                  key={habit.id}
                  data-habit-item
                  data-state={isCompleted ? "checked" : "unchecked"}
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
                  {isYesterday ? (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      YESTERDAY
                    </span>
                  ) : null}
                  <span className="ml-auto text-sm font-medium text-xp">
                    +{difficultyToXp(habit.difficulty as HabitDifficulty)} XP
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Anti-Habits
        </p>
        {antiHabits.length === 0 ? (
          <p className="text-muted-foreground text-sm">No anti-habits yet.</p>
        ) : (
          <div className="space-y-2" role="list">
            {antiHabits.map((habit: Habit) => (
              <AntiHabitItem
                key={habit.id}
                habit={habit}
                entry={entryMap.get(habit.id)}
                onToggle={(id) => postAntiHabitAction(id, "toggle")}
                onIncrement={(id) => postAntiHabitAction(id, "increment")}
                onDecrement={(id) => postAntiHabitAction(id, "decrement")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
