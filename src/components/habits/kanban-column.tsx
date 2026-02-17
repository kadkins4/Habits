"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "@/components/habits/kanban-card";
import type { Habit, HabitStatus } from "@/lib/types";

type KanbanColumnProps = {
  status: HabitStatus;
  title: string;
  habits: Habit[];
  onCardClick: (habit: Habit) => void;
};

export function KanbanColumn({ status, title, habits, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border bg-muted/30 p-3 min-h-[200px] transition-colors ${
        isOver ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {habits.length}
        </Badge>
      </div>

      <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {habits.map((habit) => (
            <KanbanCard
              key={habit.id}
              habit={habit}
              onClick={() => onCardClick(habit)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
