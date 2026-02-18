"use client";

import type { Habit, AntiHabitEntry } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

type AntiHabitItemProps = {
  habit: Habit;
  entry: AntiHabitEntry | undefined;
  onToggle: (habitId: string) => void;
  onIncrement: (habitId: string) => void;
  onDecrement: (habitId: string) => void;
};

export function AntiHabitItem({ habit, entry, onToggle, onIncrement, onDecrement }: AntiHabitItemProps) {
  const isAvoided = entry?.avoided === 1;
  const temptationCount = entry?.temptation_count ?? 0;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isAvoided ? "border-success/30 bg-success/5" : ""
      }`}
    >
      <Checkbox
        checked={isAvoided}
        onClick={() => onToggle(habit.id)}
        tabIndex={-1}
      />
      <span className={isAvoided ? "line-through text-muted-foreground" : ""}>
        {habit.name}
      </span>
      <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
        <button
          onClick={() => onDecrement(habit.id)}
          className="w-6 h-6 rounded hover:bg-accent flex items-center justify-center disabled:opacity-40"
          disabled={temptationCount === 0}
          aria-label="Decrease temptation count"
        >
          −
        </button>
        <span className="w-5 text-center tabular-nums">{temptationCount}</span>
        <button
          onClick={() => onIncrement(habit.id)}
          className="w-6 h-6 rounded hover:bg-accent flex items-center justify-center"
          aria-label="Increase temptation count"
        >
          +
        </button>
        <span className="text-xs ml-0.5">temptations</span>
      </div>
    </div>
  );
}
