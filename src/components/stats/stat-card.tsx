"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { XpDelta } from "@/components/stats/xp-delta";
import type { Score } from "@/lib/types";

type StatCardProps = {
  title: string;
  score: Score;
  subtitle?: string;
  children?: ReactNode;
};

export function StatCard({ title, score, subtitle, children }: StatCardProps) {
  const { earned, possible, percentage } = score;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm font-medium text-xp">
          {earned} / {possible} XP
          <XpDelta earned={earned} />
        </div>
        <Progress value={percentage} />
        <div className="text-sm text-right text-muted-foreground">
          {percentage}%{subtitle ? ` — ${subtitle}` : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
