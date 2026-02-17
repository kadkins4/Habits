import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Habit } from "@/lib/types";

type HabitEditorRowProps = {
  habit: Habit;
  isEditing: boolean;
  editName: string;
  editXp: string;
  onEditNameChange: (value: string) => void;
  onEditXpChange: (value: string) => void;
  onSave: () => void;
  onStartEditing: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
};

export function HabitEditorRow({
  habit,
  isEditing,
  editName,
  editXp,
  onEditNameChange,
  onEditXpChange,
  onSave,
  onStartEditing,
  onToggleActive,
  onDelete,
}: HabitEditorRowProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border p-2 ${
        habit.active === 0 ? "opacity-50" : ""
      }`}
    >
      <Checkbox
        checked={habit.active === 1}
        onCheckedChange={onToggleActive}
      />

      {isEditing ? (
        <>
          <Input
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="h-8 text-sm flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
            }}
          />
          <Input
            value={editXp}
            onChange={(e) => onEditXpChange(e.target.value)}
            className="h-8 text-sm w-16"
            type="number"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={onSave}
          >
            Save
          </Button>
        </>
      ) : (
        <>
          <span
            className="flex-1 text-sm cursor-pointer"
            onClick={onStartEditing}
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
            onClick={onStartEditing}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 px-2 text-xs"
            onClick={onDelete}
          >
            Del
          </Button>
        </>
      )}
    </div>
  );
}
