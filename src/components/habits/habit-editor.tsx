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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabits, useCompletions, useStats } from "@/lib/api";
import { formatDate } from "@/lib/types";
import type { Habit } from "@/lib/types";

export function HabitEditor() {
  const [open, setOpen] = useState(false);
  const { habits, mutate: mutateHabits } = useHabits();
  const { mutate: mutateCompletions } = useCompletions(formatDate(new Date()));
  const { mutate: mutateStats } = useStats();

  const [newName, setNewName] = useState("");
  const [newXp, setNewXp] = useState("10");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editXp, setEditXp] = useState("");

  function revalidateAll() {
    mutateHabits();
    mutateCompletions();
    mutateStats();
  }

  async function createHabit() {
    if (!newName.trim()) return;

    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), xp: Number(newXp) || 10 }),
    });

    setNewName("");
    setNewXp("10");
    revalidateAll();
  }

  async function updateHabit(id: string) {
    await fetch(`/api/habits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        xp: Number(editXp) || 10,
      }),
    });

    setEditingId(null);
    revalidateAll();
  }

  async function toggleActive(habit: Habit) {
    await fetch(`/api/habits/${habit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: habit.active === 1 ? 0 : 1 }),
    });
    revalidateAll();
  }

  async function deleteHabit(id: string) {
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    revalidateAll();
  }

  function startEditing(habit: Habit) {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditXp(String(habit.xp));
  }

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
            <div
              key={habit.id}
              className={`flex items-center gap-2 rounded-lg border p-2 ${
                habit.active === 0 ? "opacity-50" : ""
              }`}
            >
              <Checkbox
                checked={habit.active === 1}
                onCheckedChange={() => toggleActive(habit)}
              />

              {editingId === habit.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") updateHabit(habit.id);
                    }}
                  />
                  <Input
                    value={editXp}
                    onChange={(e) => setEditXp(e.target.value)}
                    className="h-8 text-sm w-16"
                    type="number"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => updateHabit(habit.id)}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 text-sm cursor-pointer"
                    onClick={() => startEditing(habit)}
                  >
                    {habit.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {habit.xp} XP
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => startEditing(habit)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 px-2 text-xs"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    Del
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Input
            placeholder="New habit name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") createHabit();
            }}
          />
          <Input
            placeholder="XP"
            value={newXp}
            onChange={(e) => setNewXp(e.target.value)}
            className="h-8 text-sm w-16"
            type="number"
          />
          <Button
            size="sm"
            className="h-8"
            onClick={createHabit}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
