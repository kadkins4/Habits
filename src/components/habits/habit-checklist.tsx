"use client";

import type { KeyboardEvent } from "react";
import { useHabits, useCompletions, useStats, useDailyStats, useAntiHabitEntries } from "@/lib/api";
import type { Habit, Completion, AntiHabitEntry, AntiHabitStatus } from "@/lib/types";
import { HabitItem } from "@/components/habits/habit-item";
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

  async function setAntiHabitStatus(habitId: string, status: AntiHabitStatus) {
    await fetch("/api/anti-habit-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date, action: "set_status", status }),
    });
    mutateEntries();
  }

  async function postAntiHabitAction(habitId: string, action: "increment" | "decrement") {
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
            {regularHabits.map((habit: Habit, index: number) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={completedHabitIds.has(habit.id)}
                isYesterday={isYesterday}
                index={index}
                onToggle={toggleHabit}
                onKeyDown={handleKeyDown}
              />
            ))}
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
                onSetStatus={(id, status) => setAntiHabitStatus(id, status)}
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
