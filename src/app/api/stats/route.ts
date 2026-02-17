import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import {
  calculateDailyScore,
  calculateWeeklyScore,
  calculateMonthlyScore,
  calculateStreak,
  formatDate,
} from "@/lib/scoring";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const settingsRow = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "include_weekends"));

    const includeWeekends = settingsRow.length > 0 && settingsRow[0].value === "true";

    const date = dateParam ?? formatDate(new Date());

    const daily = calculateDailyScore(date);

    // Only return full stats when no date filter (default "today" view)
    if (dateParam) {
      return NextResponse.json({ daily });
    }

    const weekly = calculateWeeklyScore(includeWeekends);
    const monthly = calculateMonthlyScore();
    const streak = calculateStreak(includeWeekends);

    return NextResponse.json({ daily, weekly, monthly, streak });
  } catch (error) {
    console.error("GET /api/stats failed:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
