"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { useKanban } from "@/components/habits/use-kanban";
import { KanbanColumn } from "@/components/habits/kanban-column";
import { KanbanCard } from "@/components/habits/kanban-card";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { COLUMN_CONFIG } from "@/components/habits/utils";
import type { ReactNode } from "react";

type KanbanBoardProps = {
  backLink?: ReactNode;
};

export function KanbanBoard({ backLink }: KanbanBoardProps) {
  const {
    columns,
    activeHabit,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingHabit,
    defaultStatus,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    openCreate,
    openEdit,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useKanban();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Manage Habits</h1>
          <Button onClick={() => openCreate("active")}>New</Button>
        </div>
        {backLink}
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          {COLUMN_CONFIG.map(({ status, title }) => (
            <KanbanColumn
              key={status}
              status={status}
              title={title}
              habits={columns[status]}
              onCardClick={openEdit}
            />
          ))}
        </div>

        <DragOverlay>
          {activeHabit ? (
            <KanbanCard habit={activeHabit} onClick={() => {}} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <HabitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        defaultStatus={defaultStatus}
        onSave={(data) => {
          if (editingHabit) {
            updateHabit(editingHabit.id, data);
          } else {
            createHabit(data);
          }
        }}
        onDelete={deleteHabit}
      />
    </>
  );
}
