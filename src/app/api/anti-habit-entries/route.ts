import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { antiHabitEntries } from "@/db/schema";
import type { AntiHabitStatus } from "@/lib/types";

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

const VALID_STATUSES: AntiHabitStatus[] = ["unknown", "avoided", "slipped"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { habitId, date, action, status } = body as {
      habitId: string;
      date: string;
      action: "set_status" | "increment" | "decrement";
      status?: AntiHabitStatus;
    };

    const existing = await db
      .select()
      .from(antiHabitEntries)
      .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
      .get();

    if (action === "set_status") {
      if (!status || !VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      if (status === "unknown") {
        if (existing) {
          await db.delete(antiHabitEntries)
            .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
            .run();
        }
      } else {
        if (!existing) {
          await db.insert(antiHabitEntries)
            .values({ id: crypto.randomUUID(), habit_id: habitId, date, status, temptation_count: 0 })
            .run();
        } else {
          await db.update(antiHabitEntries)
            .set({ status })
            .where(and(eq(antiHabitEntries.habit_id, habitId), eq(antiHabitEntries.date, date)))
            .run();
        }
      }
    } else if (action === "increment") {
      if (!existing) {
        await db.insert(antiHabitEntries)
          .values({ id: crypto.randomUUID(), habit_id: habitId, date, status: "unknown", temptation_count: 1 })
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
