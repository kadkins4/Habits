"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabitEditor } from "@/components/habits/use-habit-editor";
import { HabitEditorRow } from "@/components/habits/habit-editor-row";
import { HabitCreateForm } from "@/components/habits/habit-create-form";
import type { Habit } from "@/lib/types";

export function HabitEditor() {
  const [open, setOpen] = useState(false);
  const {
    habits,
    editingId,
    editName,
    setEditName,
    editXp,
    setEditXp,
    createHabit,
    updateHabit,
    toggleActive,
    deleteHabit,
    startEditing,
  } = useHabitEditor();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Habits</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Habits</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {habits.map((habit: Habit) => (
            <HabitEditorRow
              key={habit.id}
              habit={habit}
              isEditing={editingId === habit.id}
              editName={editName}
              editXp={editXp}
              onEditNameChange={setEditName}
              onEditXpChange={setEditXp}
              onSave={() => updateHabit(habit.id)}
              onStartEditing={() => startEditing(habit)}
              onToggleActive={() => toggleActive(habit)}
              onDelete={() => deleteHabit(habit.id)}
            />
          ))}
        </div>

        <HabitCreateForm onCreate={createHabit} />
      </DialogContent>
    </Dialog>
  );
}
