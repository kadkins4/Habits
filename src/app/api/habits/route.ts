import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = db.select().from(habits);

    const result = status === "all"
      ? await query.orderBy(habits.sort_order)
      : await query.where(eq(habits.status, status ?? "active")).orderBy(habits.sort_order);

    return NextResponse.json({ habits: result });
  } catch (error) {
    console.error("GET /api/habits failed:", error);
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, difficulty = "medium", type = "habit", description, icon, status = "active" } = body as {
      name: string;
      difficulty?: string;
      type?: string;
      description?: string;
      icon?: string;
      status?: string;
    };

    const maxOrder = await db
      .select({ max: sql<number>`coalesce(max(${habits.sort_order}), 0)` })
      .from(habits);

    const habit = {
      id: crypto.randomUUID(),
      name,
      status,
      difficulty,
      type,
      description: description ?? null,
      icon: icon ?? null,
      sort_order: maxOrder[0].max + 1,
      created_at: new Date().toISOString(),
    };

    await db.insert(habits).values(habit);

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error("POST /api/habits failed:", error);
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
