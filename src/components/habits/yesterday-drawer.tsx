"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { DailyProgress } from "@/components/stats/daily-progress";
import { Button } from "@/components/ui/button";

type YesterdayDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yesterdayDate: string;
  displayDate: string;
  isConfirmed: boolean;
  onConfirm: () => void;
};

export function YesterdayDrawer({
  open,
  onOpenChange,
  yesterdayDate,
  displayDate,
  isConfirmed,
  onConfirm,
}: YesterdayDrawerProps) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Yesterday — {displayDate}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-6 overflow-y-auto">
          {open ? (
            <>
              <HabitChecklist date={yesterdayDate} isYesterday />
              <DailyProgress date={yesterdayDate} />
              {isConfirmed ? (
                <p className="text-sm text-center text-muted-foreground py-2">
                  Yesterday reviewed
                </p>
              ) : (
                <Button
                  onClick={handleConfirm}
                  className="w-full"
                  variant="outline"
                >
                  Confirm yesterday
                </Button>
              )}
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
