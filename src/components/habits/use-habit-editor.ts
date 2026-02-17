import { useState } from "react";
import { useHabits, useCompletions, useStats } from "@/lib/api";
import { formatDate } from "@/lib/types";
import type { Habit } from "@/lib/types";

export function useHabitEditor() {
  const { habits, mutate: mutateHabits } = useHabits();
  const { mutate: mutateCompletions } = useCompletions(formatDate(new Date()));
  const { mutate: mutateStats } = useStats();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editXp, setEditXp] = useState("");

  function revalidateAll() {
    mutateHabits();
    mutateCompletions();
    mutateStats();
  }

  async function createHabit(name: string, xp: number) {
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, xp }),
    });
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

  return {
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
  };
}
