import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { completions } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date parameter required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(completions)
    .where(eq(completions.date, date));

  return NextResponse.json({ completions: result });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { habit_id, date } = body as { habit_id: string; date: string };

  const existing = await db
    .select()
    .from(completions)
    .where(and(eq(completions.habit_id, habit_id), eq(completions.date, date)));

  if (existing.length > 0) {
    await db
      .delete(completions)
      .where(and(eq(completions.habit_id, habit_id), eq(completions.date, date)));

    return NextResponse.json({ completed: false });
  }

  await db.insert(completions).values({
    id: crypto.randomUUID(),
    habit_id,
    date,
  });

  return NextResponse.json({ completed: true }, { status: 201 });
}
