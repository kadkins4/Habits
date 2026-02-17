"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_COLORS } from "@/components/habits/utils";
import { difficultyToXp } from "@/lib/types";
import type { Habit, HabitDifficulty } from "@/lib/types";

type KanbanCardProps = {
  habit: Habit;
  onClick: () => void;
  isDragOverlay?: boolean;
};

export function KanbanCard({ habit, onClick, isDragOverlay = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id, disabled: isDragOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const difficultyColor = DIFFICULTY_COLORS[habit.difficulty] ?? DIFFICULTY_COLORS.medium;
  const xp = difficultyToXp(habit.difficulty as HabitDifficulty);

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
      onClick={onClick}
      className="rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{habit.icon ?? "📌"}</span>
        <span className="font-medium text-sm truncate flex-1">{habit.name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary" className={`text-xs ${difficultyColor}`}>
          {habit.difficulty} · {xp} XP
        </Badge>
        {habit.type === "antihabit" ? (
          <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
            anti
          </Badge>
        ) : null}
      </div>
      {habit.description ? (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{habit.description}</p>
      ) : null}
    </div>
  );
}
