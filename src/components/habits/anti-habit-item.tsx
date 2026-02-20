"use client";

import { ShieldCheck, AlertTriangle } from "lucide-react";
import type { Habit, AntiHabitEntry, AntiHabitStatus } from "@/lib/types";

type AntiHabitItemProps = {
  habit: Habit;
  entry: AntiHabitEntry | undefined;
  onSetStatus: (habitId: string, status: AntiHabitStatus) => void;
  onIncrement: (habitId: string) => void;
  onDecrement: (habitId: string) => void;
};

export function AntiHabitItem({ habit, entry, onSetStatus, onIncrement, onDecrement }: AntiHabitItemProps) {
  const status: AntiHabitStatus = (entry?.status as AntiHabitStatus) ?? "unknown";
  const temptationCount = entry?.temptation_count ?? 0;
  const isAutoFailed = status === "auto_failed";

  function handleStatusClick(targetStatus: "avoided" | "slipped") {
    if (isAutoFailed) return;
    const newStatus: AntiHabitStatus = status === targetStatus ? "unknown" : targetStatus;
    onSetStatus(habit.id, newStatus);
  }

  const rowClass =
    status === "avoided"
      ? "border-success/30 bg-success/5"
      : status === "slipped"
        ? "border-amber-500/30 bg-amber-500/5"
        : status === "auto_failed"
          ? "border-destructive/30 bg-destructive/5"
          : "";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${rowClass}`}
    >
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleStatusClick("avoided")}
          disabled={isAutoFailed}
          aria-label="Avoided"
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            status === "avoided"
              ? "bg-success text-success-foreground"
              : "border border-success/40 text-success/70 hover:bg-success/10"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ShieldCheck className="h-3.5 w-3.5 sm:hidden" />
          <span className="hidden sm:inline">Avoided</span>
        </button>
        <button
          onClick={() => handleStatusClick("slipped")}
          disabled={isAutoFailed}
          aria-label="Slipped"
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            status === "slipped"
              ? "bg-amber-500 text-white"
              : "border border-amber-500/40 text-amber-500/70 hover:bg-amber-500/10"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <AlertTriangle className="h-3.5 w-3.5 sm:hidden" />
          <span className="hidden sm:inline">Slipped</span>
        </button>
      </div>
      <span className={status === "avoided" ? "line-through text-muted-foreground" : ""}>
        {habit.name}
      </span>
      {isAutoFailed ? (
        <span className="ml-auto text-xs font-medium text-destructive">Auto-failed</span>
      ) : (
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
      )}
    </div>
  );
}
