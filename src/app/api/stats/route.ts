import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import {
  calculateDailyScore,
  calculateWeeklyScore,
  calculateMonthlyScore,
  calculateStreak,
} from "@/lib/scoring";

export async function GET() {
  const settingsRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "include_weekends"));

  const includeWeekends = settingsRow.length > 0 && settingsRow[0].value === "true";

  const today = new Date().toISOString().split("T")[0];

  const daily = calculateDailyScore(today);
  const weekly = calculateWeeklyScore(includeWeekends);
  const monthly = calculateMonthlyScore();
  const streak = calculateStreak(includeWeekends);

  return NextResponse.json({ daily, weekly, monthly, streak });
}
