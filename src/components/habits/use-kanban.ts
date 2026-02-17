import { useState, useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useAllHabits } from "@/lib/api";
import { COLUMN_CONFIG } from "@/components/habits/utils";
import type { Habit, HabitStatus } from "@/lib/types";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";

export function useKanban() {
  const { habits, mutate, isLoading } = useAllHabits();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<HabitStatus>("active");

  const columns = useMemo(() => {
    const grouped: Record<HabitStatus, Habit[]> = { backlog: [], active: [], archived: [] };
    for (const habit of habits) {
      const status = habit.status as HabitStatus;
      if (grouped[status]) {
        grouped[status].push(habit);
      }
    }
    return grouped;
  }, [habits]);

  const activeHabit = useMemo(
    () => habits.find((h: Habit) => h.id === activeId) ?? null,
    [habits, activeId]
  );

  function findColumn(id: string): HabitStatus | null {
    for (const { status } of COLUMN_CONFIG) {
      if (columns[status].some((h) => h.id === id)) return status;
    }
    // Check if it's a column droppable ID
    if (id === "backlog" || id === "active" || id === "archived") return id;
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeCol = findColumn(active.id as string);
    let overCol = findColumn(over.id as string);

    // If over is a column droppable, use that
    if (over.id === "backlog" || over.id === "active" || over.id === "archived") {
      overCol = over.id as HabitStatus;
    }

    if (!activeCol || !overCol || activeCol === overCol) return;

    // Move item between columns optimistically
    mutate((data: { habits: Habit[] } | undefined) => {
      if (!data) return data;
      const updated = data.habits.map((h: Habit) =>
        h.id === active.id ? { ...h, status: overCol as string } : h
      );
      return { habits: updated };
    }, false);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCol = findColumn(active.id as string);
    let overCol = findColumn(over.id as string);

    if (over.id === "backlog" || over.id === "active" || over.id === "archived") {
      overCol = over.id as HabitStatus;
    }

    if (!activeCol || !overCol) return;

    // Build the updated column
    const col = [...columns[overCol]];
    const oldIndex = col.findIndex((h) => h.id === active.id);
    const newIndex = col.findIndex((h) => h.id === over.id);

    let reordered: Habit[];
    if (oldIndex !== -1 && newIndex !== -1 && activeCol === overCol) {
      reordered = arrayMove(col, oldIndex, newIndex);
    } else {
      reordered = col;
    }

    // Build batch update items for all habits in affected columns
    const items: { id: string; status: string; sort_order: number }[] = [];

    for (const { status } of COLUMN_CONFIG) {
      const list = status === overCol ? reordered : columns[status];
      list.forEach((h, i) => {
        items.push({ id: h.id, status, sort_order: i });
      });
    }

    await fetch("/api/habits/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    mutate();
  }

  function openCreate(status: HabitStatus = "active") {
    setEditingHabit(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit);
    setDialogOpen(true);
  }

  async function createHabit(data: { name: string; difficulty: string; type: string; description: string; icon: string; status: string }) {
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutate();
    setDialogOpen(false);
  }

  async function updateHabit(id: string, data: { name: string; difficulty: string; type: string; description: string; icon: string; status: string }) {
    await fetch(`/api/habits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutate();
    setDialogOpen(false);
  }

  async function deleteHabit(id: string) {
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    mutate();
    setDialogOpen(false);
  }

  return {
    columns,
    activeHabit,
    activeId,
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
  };
}
