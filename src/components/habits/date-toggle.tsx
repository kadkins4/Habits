import type { DateView } from "@/lib/use-date-toggle";

type DateToggleProps = {
  view: DateView;
  onToggle: (view: DateView) => void;
};

export function DateToggle({ view, onToggle }: DateToggleProps) {
  const label = view === "today" ? "Yesterday" : "Today";

  function handleClick() {
    onToggle(view === "today" ? "yesterday" : "today");
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs font-medium px-2.5 py-1 rounded-full border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {label}
    </button>
  );
}
