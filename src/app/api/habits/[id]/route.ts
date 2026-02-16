import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.xp !== undefined) updates.xp = body.xp;
  if (body.active !== undefined) updates.active = body.active;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

  await db.update(habits).set(updates).where(eq(habits.id, id));

  const [habit] = await db.select().from(habits).where(eq(habits.id, id));

  return NextResponse.json({ habit });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.update(habits).set({ active: 0 }).where(eq(habits.id, id));

  return NextResponse.json({ success: true });
}
