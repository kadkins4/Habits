import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";

export async function GET() {
  const result = await db
    .select()
    .from(habits)
    .where(eq(habits.active, 1))
    .orderBy(habits.sort_order);

  return NextResponse.json({ habits: result });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, xp } = body as { name: string; xp: number };

  const maxOrder = await db
    .select({ max: sql<number>`coalesce(max(${habits.sort_order}), 0)` })
    .from(habits);

  const habit = {
    id: crypto.randomUUID(),
    name,
    xp,
    active: 1,
    sort_order: maxOrder[0].max + 1,
    created_at: new Date().toISOString(),
  };

  await db.insert(habits).values(habit);

  return NextResponse.json({ habit }, { status: 201 });
}
