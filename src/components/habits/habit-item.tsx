"use client";

import type { KeyboardEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { difficultyToXp } from "@/lib/types";
import type { Habit, HabitDifficulty } from "@/lib/types";

type HabitItemProps = {
  habit: Habit;
  isCompleted: boolean;
  isYesterday: boolean;
  index: number;
  onToggle: (habitId: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, index: number) => void;
};

export function HabitItem({ habit, isCompleted, isYesterday, index, onToggle, onKeyDown }: HabitItemProps) {
  return (
    <div
      data-habit-item
      data-state={isCompleted ? "checked" : "unchecked"}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => onKeyDown(e, index)}
      onClick={() => onToggle(habit.id)}
      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${
        isCompleted ? "border-success/30 bg-success/5" : ""
      }`}
    >
      <Checkbox
        checked={isCompleted}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(habit.id);
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
}
