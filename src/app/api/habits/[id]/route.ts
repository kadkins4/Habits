import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.status !== undefined) updates.status = body.status;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.type !== undefined) updates.type = body.type;
    if (body.description !== undefined) updates.description = body.description;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

    await db.update(habits).set(updates).where(eq(habits.id, id));

    const [habit] = await db.select().from(habits).where(eq(habits.id, id));

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error("PUT /api/habits/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.update(habits).set({ status: "archived" }).where(eq(habits.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/habits/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
