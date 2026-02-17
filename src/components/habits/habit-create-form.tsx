import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HabitCreateFormProps = {
  onCreate: (name: string, xp: number) => void;
};

export function HabitCreateForm({ onCreate }: HabitCreateFormProps) {
  const [newName, setNewName] = useState("");
  const [newXp, setNewXp] = useState("10");

  function handleCreate() {
    if (!newName.trim()) return;
    onCreate(newName.trim(), Number(newXp) || 10);
    setNewName("");
    setNewXp("10");
  }

  return (
    <div className="flex items-center gap-2 pt-2 border-t">
      <Input
        placeholder="New habit name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="h-8 text-sm flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreate();
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
        onClick={handleCreate}
      >
        Add
      </Button>
    </div>
  );
}
