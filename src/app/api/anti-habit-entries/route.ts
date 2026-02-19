import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { antiHabitEntries } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const entries = await db
      .select()
      .from(antiHabitEntries)
      .where(eq(antiHabitEntries.date, date));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET /api/anti-habit-entries failed:", error);
    return NextResponse.json({ error: "Failed to fetch anti-habit entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { habitId, date, action } = body as {
      habitId: string;
      date: string;
      action: "toggle" | "increment" | "decrement";
    };

    const existing = await db
      .select()
      .from(antiHabitEntries)
      .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
      .get();

    if (action === "toggle") {
      if (!existing) {
        await db.insert(antiHabitEntries)
          .values({ id: crypto.randomUUID(), habit_id: habitId, date, avoided: 1, temptation_count: 0 })
          .run();
      } else {
        await db.update(antiHabitEntries)
          .set({ avoided: existing.avoided === 1 ? 0 : 1 })
          .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
          .run();
      }
    } else if (action === "increment") {
      if (!existing) {
        await db.insert(antiHabitEntries)
          .values({ id: crypto.randomUUID(), habit_id: habitId, date, avoided: 0, temptation_count: 1 })
          .run();
      } else {
        await db.update(antiHabitEntries)
          .set({ temptation_count: existing.temptation_count + 1 })
          .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
          .run();
      }
    } else if (action === "decrement") {
      if (existing && existing.temptation_count > 0) {
        await db.update(antiHabitEntries)
          .set({ temptation_count: existing.temptation_count - 1 })
          .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
          .run();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/anti-habit-entries failed:", error);
    return NextResponse.json({ error: "Failed to update anti-habit entry" }, { status: 500 });
  }
}
