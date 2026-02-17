import { NextResponse } from "next/server";
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

    const date = dateParam ?? formatDate(new Date());

    const daily = calculateDailyScore(date);

    // Only return full stats when no date filter (default "today" view)
    if (dateParam) {
      return NextResponse.json({ daily });
    }

    const weekly = calculateWeeklyScore();
    const monthly = calculateMonthlyScore();
    const streak = calculateStreak();

    return NextResponse.json({ daily, weekly, monthly, streak });
  } catch (error) {
    console.error("GET /api/stats failed:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
