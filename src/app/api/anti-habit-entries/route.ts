import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { antiHabitEntries } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const entries = db
    .select()
    .from(antiHabitEntries)
    .where(eq(antiHabitEntries.date, date))
    .all();

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { habitId, date, action } = body as {
    habitId: string;
    date: string;
    action: "toggle" | "increment" | "decrement";
  };

  const existing = db
    .select()
    .from(antiHabitEntries)
    .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
    .get();

  if (action === "toggle") {
    if (!existing) {
      db.insert(antiHabitEntries)
        .values({ id: crypto.randomUUID(), habit_id: habitId, date, avoided: 1, temptation_count: 0 })
        .run();
    } else {
      db.update(antiHabitEntries)
        .set({ avoided: existing.avoided === 1 ? 0 : 1 })
        .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
        .run();
    }
  } else if (action === "increment") {
    if (!existing) {
      db.insert(antiHabitEntries)
        .values({ id: crypto.randomUUID(), habit_id: habitId, date, avoided: 0, temptation_count: 1 })
        .run();
    } else {
      db.update(antiHabitEntries)
        .set({ temptation_count: existing.temptation_count + 1 })
        .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
        .run();
    }
  } else if (action === "decrement") {
    if (existing && existing.temptation_count > 0) {
      db.update(antiHabitEntries)
        .set({ temptation_count: existing.temptation_count - 1 })
        .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
        .run();
    }
  }

  return NextResponse.json({ ok: true });
}
