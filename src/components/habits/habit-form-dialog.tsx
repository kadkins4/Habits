"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { difficultyToXp } from "@/lib/types";
import type { Habit, HabitDifficulty, HabitStatus } from "@/lib/types";

type FormData = { name: string; difficulty: string; type: string; description: string; icon: string; status: string };

type HabitFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSave: (data: FormData) => void;
  onDelete?: (id: string) => void;
  defaultStatus?: HabitStatus;
};

export function HabitFormDialog({ open, onOpenChange, habit, onSave, onDelete, defaultStatus = "active" }: HabitFormDialogProps) {
  // Use key to reset form state when habit/open changes
  const formKey = habit ? habit.id : `new-${defaultStatus}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "New Habit"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <HabitForm
            key={formKey}
            habit={habit ?? null}
            defaultStatus={defaultStatus}
            onSave={onSave}
            onDelete={onDelete}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type HabitFormProps = {
  habit: Habit | null;
  defaultStatus: HabitStatus;
  onSave: (data: FormData) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
};

function HabitForm({ habit, defaultStatus, onSave, onDelete, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [difficulty, setDifficulty] = useState<HabitDifficulty>((habit?.difficulty as HabitDifficulty) ?? "medium");
  const [type, setType] = useState(habit?.type ?? "habit");
  const [icon, setIcon] = useState(habit?.icon ?? "");
  const isEditing = !!habit;
  const xp = difficultyToXp(difficulty);
  const status = (habit?.status as HabitStatus) ?? defaultStatus;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), difficulty, type, description: description.trim(), icon: icon.trim(), status });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="habit-name">Name</Label>
        <Input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning workout"
          autoFocus
          type="text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="habit-desc">Description</Label>
        <Textarea
          id="habit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as HabitDifficulty)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy ({difficultyToXp("easy")} XP)</SelectItem>
              <SelectItem value="medium">Medium ({difficultyToXp("medium")} XP)</SelectItem>
              <SelectItem value="hard">Hard ({difficultyToXp("hard")} XP)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">+{xp} XP per completion</p>
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="habit">Habit</SelectItem>
              <SelectItem value="antihabit">Anti-habit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="habit-icon">Icon</Label>
        <Input
          id="habit-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g. 💪"
          maxLength={4}
          className="w-20"
        />
      </div>

      <div className="flex justify-between pt-2">
        <div>
          {isEditing && onDelete && habit ? (
            <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(habit.id)}>
              Archive
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {isEditing ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
}
