import { Button } from "@/components/ui/button";

type ConfirmYesterdayButtonProps = {
  isConfirmed: boolean;
  onConfirm: () => void;
};

export function ConfirmYesterdayButton({ isConfirmed, onConfirm }: ConfirmYesterdayButtonProps) {
  if (isConfirmed) {
    return (
      <div className="text-sm text-center text-muted-foreground py-2">
        Yesterday reviewed
      </div>
    );
  }

  return (
    <Button onClick={onConfirm} className="w-full" variant="outline">
      Confirm yesterday
    </Button>
  );
}
